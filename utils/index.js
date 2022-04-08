import {StemmerSv, StopwordsSv} from "@nlpjs/lang-sv"

export const getCapitalizedName = (string) => {
  let words = string.split(" ")
  words = words.map((w) => w.toLowerCase())
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

export const cleanText = (text) => {
  // let wordsToIgnore = [
  //   "jag",
  //   "du",
  //   "han",
  //   "hon",
  //   "vi",
  //   "ni",
  //   "de",
  //   "och",
  //   "eller",
  //   "en",
  //   "ett",
  //   "är",
  //   "var",
  //   "i",
  //   "går",
  //   "den",
  //   "det",
  //   "som",
  //   "att",
  //   "till",
  //   "mig",
  //   "hur",
  //   "mitt",
  //   "mina",
  //   "min",
  //   "all",
  //   "alla",
  //   "äro",
  //   "med",
  //   "sin",
  //   "om",
  //   "hela",
  //   "ut",
  //   "har",
  //   "hade",
  //   "ha",
  //   "vara",
  //   "o",
  //   "från",
  //   "dig",
  //   "ditt",
  //   "din",
  //   "där",
  //   "vid",
  //   "än",
  //   "andra",
  //   "av",
  //   "mot",
  //   "ingen",
  //   "denna",
  //   "dessa",
  //   "kan",
  //   "kunde",
  //   "skulle",
  //   "på",
  //   "för",
  //   "vad",
  //   "vem",
  //   "när",
  //   "skall",
  //   "inte",
  //   "icke",
  // ]
  let cleanText = text
    .replaceAll("\r", " ")
    .replaceAll("\n", " ")
    .replaceAll(".", " ")
    .replaceAll(",", " ")
    .replaceAll("-", " ")
    .replaceAll("—", " ")
    .replaceAll(":", " ")
    .replaceAll(";", " ")
    .replaceAll("  ", " ")
    .replaceAll("?", " ")
    .replaceAll("!", " ")
    .replaceAll("\\")
    // .replaceAll("<br", "")
    .split(" ")
    .filter((word) => word.length > 1)
    // .filter((word) => !wordsToIgnore.includes(word))
    .filter((word) => isNaN(word))
    
    let stemmer = new StemmerSv()
    stemmer.stopwords = new StopwordsSv()
    let noSWText = stemmer.stopwords.removeStopwords(cleanText)
    return stemmer.stem(noSWText)
}
