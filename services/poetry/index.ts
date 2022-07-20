import { Request, Router } from "express"
import { cleanText, getCapitalizedName } from "../../utils/index.js"
import mongoose, { SortOrder } from "mongoose"
import multer from "multer"
import Poem from "./schema.js"
import Tag from "../tags/schema.js"
import Year from "../years/schema.js"
import { ObjectId } from "mongodb"
export const poemRoute = Router()

poemRoute.get("/", async (req: ReqWithQuery, res, next) => {
  try {
    let defaultSize = 15
    let { sort, title, source, tags, page, size } = req.query
    if (!sort || !page || !size) {
      res.status(400).send("sort, page and size params are required!")
    } else {
      let field
      let order
      if (sort) {
        field = sort.split("_")[0]
        order = sort.split("_")[1] === "asc" ? 1 : -1
      }
      
      let options = {
        title: {
          $regex: title || "",
          $options: "i",
        },
        source: {
          $regex: source || "",
          $options: "i",
        },
        tags: tags
          ? {
            $all: tags.split(" "),
          }
          : { $exists: true },

      }
      let poems: Array<IPoem> = await Poem.find(
        options
      )
        .populate({
          path: "tags",
          select: ["word", "color"],
          options: {
            limit: 5
          },
          perDocumentLimit: 5
        })
        .sort({ [field as string]: order as SortOrder, _id: 1 }) //sorting by _id is required in order to guarantee consistency
        .skip(Number(size) * (Number(page) - 1))
        .limit(Number(size))
      let count: number = await Poem.find(options).count()
      res.send({ poems, count })
    }
  } catch (error) {
    next(error)
  }
})


poemRoute.get("/single/:id", async (req, res, next) => {
  try {
    let { id } = req.params
    let poem = await Poem.findById(id).populate({
      path: "tags",
      select: ["word", "color"],
    })
    
    if (poem === null) {
      res.status(204).send()
    } else {
      res.send(poem)
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
})
poemRoute.put("/single/:id", async (req, res, next) => {
  try {
    let { id } = req.params
    
    let poem: IPoem | null = await Poem.findByIdAndUpdate(id, req.body, { returnDocument: 'after' })
    // console.log(poem);
    if (poem?._id!) res.send(poem)
    else res.status(400).send("Something went wrong")
  } catch (error) {
    next(error)
  }
})

poemRoute.post("/stats", async (req, res, next) => {
  console.log("Grab some coffee, this might take a while!")
  try {
    let poems = await Poem.find()
    let tags = await Tag.find()
    console.log("Phase 1, resetting the counter...")
    for (const poem of poems) {
      poem.tags = []
      //await poem.save()
    }
    for (const tag of tags) {
      tag.overallOccurences = 0
      await tag.save()
    }
    console.log("Phase 1 ✅")

    console.log("Phase 2, counting and creating tags...")
    for (const poem of poems) {
      let words = cleanText(poem.text.toLowerCase())
      for (const word of words) {
        let foundWord = await Tag.findOne({ word })
        //checks if the tag is already in the database
        if (foundWord) {
          //if the word exists already
          foundWord!.overallOccurences += 1
          await foundWord!.save()
          
        } else {
          let newTag = await new Tag({
            word,
            overallOccurences: 1,
            yearlyOccurences: [],
            color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
              Math.random() * 255
            )}, ${Math.floor(Math.random() * 255)}, .3 )`,
          })
          await newTag.save()
          
        }
      }
      for (const tag of tags as ITag[]) {
        const currentPoemTags = poem.tags as mongoose.Types.ObjectId[]
        if (words.includes(tag.word) && !currentPoemTags.includes(tag._id)) {
          
          currentPoemTags.push(tag._id)
          poem.tags = currentPoemTags
          
          
          
        }
      }
      await poem.save()
    }
    console.log("Phase 2 ✅\n Moving on to yearly stats...")
    console.log("Almost there... go have a walk, I'll be done soon!")
    console.log("Phase 1, dividing by year...")
    await Year.deleteMany()

    let poemsByYear = await Poem.aggregate([
      {
        $group: {
          _id: "$year",
          year: { $first: "$year" },
          poems: {
            $push: "$$ROOT",
          },
        },
      },
    ])
    let results: YearResults = {}
    for (const year of poemsByYear) {
      let newYear = await new Year()
      for (const poem of year.poems) {

        if (Object.keys(results).includes(year.year)) {
          results[(year.year) as keyof YearResults] = [...results[year.year], ...poem.tags]

        } else results[(year.year) as keyof YearResults] = [...poem.tags]
      }

      newYear.year = year.year,
      (newYear.tags as ITag[]) = results[year.year]
      newYear.poems = year.poems
      await newYear.save()
    }
    console.log("Phase 1 ✅ \nStarting phase 2, cleaning tags.")
    let years = await Year.find()
    for (const year of years) {
      for (const tag of year.tags!) {

        let foundTag = await Tag.findByIdAndUpdate(tag, { yearlyOccurences: [] })
        await foundTag!.save()
      }

    }
    console.log("Phase 2 ✅ \nStarting phase 3, counting.")
    for (const year of years) {
      console.log("Phase 3 ⏲️ \n Checking ", year.year)
      for (const poem of year.poems!) {
        let currentPoem = await Poem.findById(poem)
        let currCleanText = cleanText(currentPoem!.text)
        for (const word of currCleanText) {
          
          let foundTag = await Tag.findOne({ word: word.toLowerCase() })
          if (foundTag !== null) {
            let yearsInTag = foundTag!.yearlyOccurences.map(t => t.year)
            if (yearsInTag.includes(year.year)) {
              for (const tagYear of foundTag!.yearlyOccurences) {
                if (tagYear.year === year.year) {
                  tagYear.occurences += 1
                }
              }
            } else foundTag!.yearlyOccurences.push({ year: year.year, occurences: 1 })
            await foundTag!.save()
          }
        }
      }
    }
    console.log("Phase 3 ✅ \nStarting phase 4, sorting!")
    const sortCb = (a:ITag,b:ITag, i:number) => {
      
      if(a.yearlyOccurences[i] && b.yearlyOccurences[i]) return a.yearlyOccurences[i].occurences - b.yearlyOccurences[i].occurences
      else return 0
      
    }
    for(const year of years) {
      const yearlyTags = year!.tags as ITag[]
      for(let i = 0; i < yearlyTags.length; i++) {
        for(let y = 0; y < yearlyTags[i].yearlyOccurences.length; y++) {

      yearlyTags.sort((a,b)=> sortCb(a,b,y))
    }}
    year!.tags = yearlyTags
    await year.save()
  }
    

    res.send("done ✅")
  } catch (error) {
    next(error)
    console.log(error)
  }
})

poemRoute.get("/stats", async (req, res, next) => {
  try {
    let stats = await Tag.find().sort({ overallOccurences: -1 })
    res.send(stats)
  } catch (error) {
    next(error)
  }
})


poemRoute.get("/stats/years/:year", async (req, res, next) => {
  try {
    let year = await Year.findOne({year: req.params.year}).populate(['tags', 'poems'])

      for (const poem of year!.poems! as IPoem[]) {
       
        for (const id of poem.tags) {
          const tag = await Tag.findById(id)
       
          const filteredTags = tag!.yearlyOccurences.filter(occ => occ.year === req.params.year)
          tag!.yearlyOccurences = filteredTags
        }
        
        
          
        
  }



    res.send(year)
  } catch (error) {
    next(error)
  }
})

poemRoute.get("/stats/:id", async (req, res, next) => {
  try {
    let poem: IPoem | null = await Poem.findById(req.params.id)
    let results: IResult = {}

    let words = cleanText(poem!.text.toLowerCase() as string)
    for (const word of words) {
      if (Object.keys(results).includes(word)) {
        //if the word was already added
        results[word as keyof IResult].occurences += 1
      } else {
        results[word] = {
          occurences: 1,
          color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255
          )}, ${Math.floor(Math.random() * 255)}, .3 )`,
        }

        // results[word].color = `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, .5 )`
      }
    }

    let listedResults = []
    for (const res of Object.keys(results)) {
      listedResults.push({
        word: res,
        occurences: results[res].occurences,
        color: results[res].color,
      })
    }
    listedResults.sort((a, b) => b.occurences - a.occurences)
    res.send(listedResults)
  } catch (error) {
    next(error)
  }
})

poemRoute.post("/", async (req, res, next) => {
  try {
    let title = getCapitalizedName(req.body.title)
    let newPoem = new Poem({ ...req.body, title })
    let { _id } = await newPoem.save()
    // const ok = await newPoem.save()
    res.status(201).send({ _id })
  } catch (error: any) {
    if (error.name.includes("ValidationError")) {
      res.status(400).send(error.errors)
    } else res.send(500)
  }
})

poemRoute.post(
  "/text",
  multer().fields([{ name: "txt" }, { name: "src" }, { name: "year" }]),
  async (req, res, next) => {
    try {
      let files = req.files as IFile
      let added = []
      let counter = 0
      for (const file of files!.txt) {
        let fileToString = file.buffer.toString()
        let title
        let text

        if (fileToString.length <= 0) continue
        fileToString = fileToString.replaceAll("\\r", "\\n")
        if (fileToString.includes("<big>")) {
          title = getCapitalizedName(
            fileToString.split("<big>")[1].split("</big>")[0]
          )
        } else if (fileToString.includes("<h1>")) {
          title = getCapitalizedName(
            fileToString.split("<h1>")[1].split("</h1>")[0]
          )
        } else if (fileToString.includes("<b>")) {
          title = getCapitalizedName(
            fileToString.split("<b>")[1].split("</b>")[0]
          )
        } else {
          title = fileToString?.split("\n")[0] || "Untitled"
        }
        if (fileToString.includes("<poem>")) {
          text = fileToString.split("<poem>")[1].split("</poem>")[0]
        } else if (fileToString.length > 0) {
          text = fileToString.replaceAll("<sp>", "").replaceAll("</sp>", "")
        }
        let newPoem = new Poem({
          author: req.query.author,
          text: text,
          title,
          source: req.body.src,
          year: req.body.year,
        })
        await newPoem.save()
        added.push(newPoem._id)
        counter += 1
      }
      res.status(201).send({ added, counter })
    } catch (error) {
      next(error)
    }
  }
)

poemRoute.post(
  "/html",
  multer().fields([{ name: "html" }, { name: "src" }, { name: "year" }]),
  async (req, res, next) => {
    try {

      let files = req.files as IFile

      let added = []
      let counter = 0
      for (const file of files.html) {
        let fileToString = file.buffer.toString()
        if (fileToString.includes("<h1>" && "<p>")) {
          let title = fileToString.split("<h1>")[1].split("</h1>")[0]
          let text = fileToString
            .split("<p>")[1]
            .split("</p>")[0]
            .replaceAll("<p>", "<br><br>")
            .replaceAll("<br>", "\n")
            .replaceAll("<br/ >", "\n")
          let newPoem = new Poem({
            author: req.query.author,
            text: text,
            title,
            source: req.body.src,
            year: req.body.year,
          })
          await newPoem.save()
          added.push(newPoem._id)
          counter += 1
          res.status(201).send({ added, counter })
        } else
          res
            .status(400)
            .send({ message: "HTML must contain an <h1> and a <p>" })
      }
    } catch (error) {
      next(error)
    }
  }
)

poemRoute.put("/clean", async (req, res, next) => {
  try {
    let allPoems = await Poem.find()
    allPoems.forEach((p) => {
      p.text = p.text
        .replaceAll("<br", "\n")
        .replaceAll("<br>", "\n")
        .replaceAll("<br/ >", "\n")
        .replaceAll("<br/>", "\n")
        .replaceAll("/>", "\n")
      p.title = getCapitalizedName(p.title)
      p.save()
    })
    res.send("done")
  } catch (error) { }
})


poemRoute.delete("/single/:id", async (req, res, next) => {
  try {
    await Poem.findByIdAndDelete(req.params.id)
    res.send(204)
  } catch (error) {
    next(error)
  }
})
