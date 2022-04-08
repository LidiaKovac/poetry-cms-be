import { Router } from "express"
import { cleanText, getCapitalizedName } from "../../utils/index.js"
import multer from "multer"
import Poem from "./schema.js"
import { compareTwoStrings } from "string-similarity"

export const poemRoute = Router()

poemRoute.get("/", async (req, res, next) => {
  try {
    let poems = await Poem.find()
    res.send(poems)
  } catch (error) {
    next(error)
  }
})

poemRoute.get("/stats", async (req, res, next) => {
  try {
    let poems = await Poem.find()
    let results = {  }
    for (const poem of poems) {
      let words = cleanText(poem.text.toLowerCase())
      for (const word of words) {
        if (Object.keys(results).includes(word)) {
          //if the word was already added
          results[word].occurences += 1
        } else {
          results[word] = { occurences: 1 }

          // let closestWord = Object.keys(results).filter(
          //   (sw) => compareTwoStrings(sw, word) >= 0.8
          // )

          // if (closestWord.length > 0) {
          //   results[closestWord[0]].occurences += 1
          // } else {
          //   results[word] = { occurences: 1 }
          // }
        }
      }
    }
    
    let listedResults = []
    for (const res of Object.keys(results)) {
      listedResults.push({ word: res, occurences: results[res].occurences })
    }
    listedResults.sort((a,b)=> b.occurences - a.occurences)
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

poemRoute.post("/textMulti", multer().fields([{name: "txt"}, {name: "src"}, {name: "year"}]), async (req, res, next) => {
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
      } else if(fileToString.includes("<b>")) {
        title = getCapitalizedName(
          fileToString.split("<b>")[1].split("</b>")[0]
        )
      }else {
        title = fileToString?.split("\n")[0] || "Untitled"
      }
      if (fileToString.includes("<poem>")) {
        text = fileToString.split("<poem>")[1].split("</poem>")[0]
      } else if (fileToString.length > 0) {
        text = fileToString
          .replaceAll("<sp>", "")
          .replaceAll("</sp>", "")
      }
      let newPoem = new Poem({ author: req.query.author, text: text, title, source: req.body.src, year: req.body.year })
      await newPoem.save()
      added.push(newPoem._id)
      counter += 1
    }
    res.send({ added, counter })
  } catch (error) {
    next(error)
  }
})

poemRoute.post("/html", multer().fields([{name: "html"}, {name: "src"}, {name: "year"}]), async (req, res, next) => {
  try {
    let { files } = req
    console.log(req.body);
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
      let newPoem = new Poem({ author: req.query.author, text: text, title, source: req.body.src, year: req.body.year })
      await newPoem.save()
      added.push(newPoem._id)
      counter += 1
    }
    res.send({ added, counter })
  } catch (error) {
    next(error)
  }
})

poemRoute.put("/clean", async(req,res,next)=> {
  try {
    
    let allPoems = await Poem.find()
    allPoems.forEach(p => {
      p.text = p.text
      .replaceAll("<br", "\n")
      .replaceAll("<br>", "\n")
      .replaceAll("<br/ >", "\n")
      .replaceAll("<br/>", "\n")
      p.save()
    })
    res.send("done")
  } catch (error) {
    
  }
})
