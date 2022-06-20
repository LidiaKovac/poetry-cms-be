import { Router } from "express"
import { cleanText, getCapitalizedName } from "../../utils/index.js"
import multer from "multer"
import Poem from "./schema.js"
import Tag from "../tags/schema.js"
import Year from "../years/schema.js"
export const poemRoute = Router()

poemRoute.get("/", async (req, res, next) => {
  try {
    let { sort, title, source, tags, page, size } = req.query
    let field
    let order
    if (sort) {
      field = sort.split("_")[0]
      order = sort.split("_")[1] === "asc" ? 1 : -1
    }
    console.log(      {
        sort: sort ? { _id: 1, [field]: order} : {_id: 1},
        skip: (Number(size) * (Number(page) - 1)),
        limit: Number(size),
      })
    Poem.find(
      {
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

      // {
      //   sort: sort ? { [field]: order } : {},
      //   skip: (Number(size) * (Number(page) - 1)),
      //   limit: Number(size),
      // }
    )
      .populate({
        path: "tags",
        select: ["word", "color"],
        options: { limit: 5 },
        perDocumentLimit: 5,
      })
      .sort({ [field]: order, _id: 1 }) //sorting by _id is required in order to guarantee consistency
      .skip(size * (page - 1))
      .limit(size)
      .exec((err, poems) => {
        if (err) res.send(500, err)
        else res.send(poems)
      })
    
  } catch (error) {
    next(error)
  }
})

poemRoute.get("/count", async (req, res, next) => {
  try {
    let count = await Poem.count()
    res.send({ count })
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
    res.send(poem)
  } catch (error) {
    next(error)
  }
})
poemRoute.put("/single/:id", async (req, res, next) => {
  try {
    let { id } = req.params
    let poem = await Poem.findByIdAndUpdate(id, req.body)
    res.send(poem)
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
      await poem.save()
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
        let tags = await Tag.find()
        let wordsOnly = tags.map((t) => t.word) //makes an array of all the words in the db already

        //checks if the tag is already in the database
        if (wordsOnly.includes(word)) {
          //if the world exists already
          let foundWord = await Tag.findOne({ word })
          foundWord.overallOccurences += 1
          await foundWord.save()
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
        for (const tag of tags) {
          if (words.includes(tag.word) && !poem.tags.includes(tag._id)) {
            poem.tags.push(tag._id)
            await poem.save()
          }
        }
      }
    }
    console.log("Phase 2 ✅")

    res.send("done ✅")
  } catch (error) {
    next(error)
  }
})

poemRoute.get("/stats", async (req, res, next) => {
  try {
    let stats = await Tag.find().sort({ occurences: -1 })
    res.send(stats)
  } catch (error) {
    next(error)
  }
})

poemRoute.post("/stats/years", async (req, res, next) => {
  try {
    console.log("Grab some coffee, this might take a while!")
    console.log("Phase 1, resetting the counter and dividing by year...")
    let results = {}
    let poems = await Poem.find()
    for (const poem of poems) {
      poem.yearlyOccurences = []
      poem.save()
    }
    let poemsByYear = await Poem.aggregate([
      {
        $group: {
          _id: "$_id",
          year: { $first: "$year" },
          poems: {
            $push: "$$ROOT",
          },
        },
      },
    ])

    console.log("Phase 1 ✅")
    console.log("Phase 2, counting...")

    for (const year of poemsByYear) {
      for (const poem of year.poems) {
        for (const tagId of poem.tags) {
          let tag = await Tag.findById(tagId)
          if (
            tag.yearlyOccurences.filter((t) => t.year === year.year).length > 0
          ) {
            let words = cleanText(poem.text.toLowerCase())
            let counter = 0
            words.forEach((w) => {
              if (w === tag.word) {
                counter++
              }
              console.log(counter)
            })
            for (const tagYear of tag.yearlyOccurences) {
              if (tagYear.year === year.year) {
                console.log(tagYear.year, year.year)
                tagYear.occurences = counter
                console.log(tagYear)
              }
            }
          } else {
            tag.yearlyOccurences.push({ year: year.year, occurences: 1 })
          }

          // console.log(tag);
          await tag.save()
        }
      }
    }

    console.log("Phase 2 ✅")

    res.send(poemsByYear)
  } catch (error) {
    next(error)
  }
})

poemRoute.get("/stats/years", async (req, res, next) => {
  try {
    //group by year
    let poemsByYear = await Poem.aggregate([
      {
        $group: {
          // _id: "$_id",
          _id: "$year",
          poems: {
            $push: "$$ROOT",
          },
        },
      },
    ])
    let cleanPoems = poemsByYear.map((poem) => {
      poem.year = poem._id
      delete poem._id
      return poem
    })
    res.send(cleanPoems)
  } catch (error) {
    next(error)
  }
})

poemRoute.get("/stats/:id", async (req, res, next) => {
  try {
    let poem = await Poem.findById(req.params.id)
    let results = {}

    let words = cleanText(poem.text.toLowerCase())
    for (const word of words) {
      if (Object.keys(results).includes(word)) {
        //if the word was already added
        results[word].occurences += 1
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
  } catch (error) {
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
      let { files } = req
      let added = []
      let counter = 0
      for (const file of files.txt) {
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
      let { files } = req

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
  } catch (error) {}
})

poemRoute.put("/convertYears", async (req, res, next) => {
  try {
    let allPoems = await Poem.find({})
    for (const p of allPoems) {
      p.year = Number(p.year)
      await p.save()
    }

    res.send("done")
  } catch (error) {}
})

poemRoute.delete("/:id", async (req, res, next) => {
  try {
    await Poem.findByIdAndDelete(req.params.id)
    res.send(204)
  } catch (error) {
    next(error)
  }
})
