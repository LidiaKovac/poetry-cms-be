import { Router } from "express"
import { cleanText, getCapitalizedName } from "../../utils/index.js"
import multer from "multer"
import Poem from "./schema.js"
import Tag from "../tags/schema.js"
import Year from "../years/schema.js"

export const poemRoute = Router()

poemRoute.get("/", async (req, res, next) => {
  try {
    let poems = await Poem.find().populate({
      path: "tags",
      select: ["word", "color"],
      options: { limit: 5 },
    })
    let { query } = req
    let filtered = []
    if (query.tag) {
      filtered = poems.filter((poem) => {
        let isMatch = true
        console.log(query.tag.split(" "))
        for (const tag of query.tag.split(" ")) {
          // console.log(tag);
          if (poem.tags.map((t) => t.word).includes(tag)) {
            continue
          } else isMatch = false
        }
        return isMatch
      })
    }
    res.send(filtered.length > 0 ? filtered : poems)
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

poemRoute.post("/stats", async (req, res, next) => {
  console.log("Grab some coffee, this might take a while!")
  try {
    let poems = await Poem.find()
    let tags = await Tag.find()
    console.log("Phase 1, resetting the counter...")
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
        let wordsOnly = tags.map((t) => t.word)

        //checks if the tag is already in the database
        if (wordsOnly.includes(word)) {
          let foundWord = await Tag.findOne({ word })
          foundWord.overallOccurences += 1
          await foundWord.save()
        } else {
          let newTag = await new Tag({
            word,
            overallOccurences: 1,
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
    // let listedResults = []
    // for (const res of Object.keys(results)) {
    //   listedResults.push({ word: res, occurences: results[res].occurences,color: results[res].color   })
    // }
    // listedResults.sort((a,b)=> b.occurences - a.occurences)
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
    let poems = await Poem.find()
    await Year.deleteMany({})
    let years = [...new Set(poems.map(poem => poem.year))]
    // let years = await Year.find()
    console.log("Phase 1, resetting the counter and dividing by year...")
    for (const year of years) {
      let newYear = await Year.create({
        year: year,
        poems: [
          ...poems
            .filter((poem) => poem.year === year)
            .map((poem) => poem._id),
        ],
        tags: []
      })
      await newYear.save()
    }
    console.log("Phase 1 ✅")

    console.log("Phase 2, counting...")
    let populatedYears = await Year.find().populate({
      path: "poems",
    })
    console.log(populatedYears);
    for (const year of populatedYears) {
      for (const poem of year.poems) {
        let words = cleanText(poem.text.toLowerCase())
        for (const word of words) {
          let years = await Year.find()
          //checks if the tag is already in the database
          if (wordsOnly.includes(word)) {
            let foundWord = await Tag.findOne({ word })
            foundWord.occurences += 1
            await foundWord.save()
          } else {
            let newTag = await new Tag({
              word,
              occurences: 1,
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
    }
    console.log("Phase 2 ✅")
    // let listedResults = []
    // for (const res of Object.keys(results)) {
    //   listedResults.push({ word: res, occurences: results[res].occurences,color: results[res].color   })
    // }
    // listedResults.sort((a,b)=> b.occurences - a.occurences)
    res.send("done ✅")
  } catch (error) {
    next(error)
  }
})

poemRoute.get("/stats/years", async (req, res, next) => {
  try {
    //group by year
    let results = {}
    let poems = await Poem.find()
    let years = poems.map((poem) => poem.year)
    years.forEach((year) => {
      results[year] = poems.filter((poem) => poem.year === year)
    })
    //for each year, object prop
    res.send(results)
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
        console.log("new word created", word)
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
    res.send({ _id })
  } catch (error) {
    next(error)
  }
})

poemRoute.post("/text", multer().single("txt"), async (req, res, next) => {
  try {
    // console.log(req.file)
    let fileToString = req.file.buffer.toString()
    let title
    let text
    if (fileToString.includes("<big>")) {
      title = getCapitalizedName(
        fileToString.split("<big>")[1].split("</big>")[0]
      )
    } else {
      title = "Untitled"
    }
    if (fileToString.includes("<poem>")) {
      text = fileToString.split("<poem>")[1].split("</poem>")[0]
    } else {
      text = fileToString
    }
    let newPoem = new Poem({
      author: req.query.author,
      text: text.replaceAll("\r", "\n"),
      title,
    })
    const { _id } = await newPoem.save()
    res.send({ _id })
  } catch (error) {
    next(error)
  }
})

poemRoute.post(
  "/textMulti",
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
      res.send({ added, counter })
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
      console.log(req.body)
      let added = []
      let counter = 0
      for (const file of files.html) {
        let fileToString = file.buffer.toString()
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
      }
      res.send({ added, counter })
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
