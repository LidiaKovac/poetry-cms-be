import {StemmerSv, StopwordsSv} from "@nlpjs/lang-sv"

export const getCapitalizedName = (string:string) => {
  let words = string.split(" ")
  words = words.map((w) => w.toLowerCase())
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

export const cleanText = (text:string) => {
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
    .replaceAll("\\", " ")
    .replaceAll("äro", "är")
    .replaceAll("<dt>", " ")
    .replaceAll("<dl>", " ")
    .replaceAll("„", "")
    .replaceAll('"', "")
    .replaceAll('1', "")
    .replaceAll('0', "")

    // .replaceAll("<br", "")
    .split(" ")
    .filter((word) => word.length > 1)
    // .filter((word) => !wordsToIgnore.includes(word))
    .filter((word) => isNaN(word as unknown as number))

    
    let stemmer = new StemmerSv()
    stemmer.stopwords = new StopwordsSv()
    let noSWText = stemmer.stopwords.removeStopwords(cleanText)
    return stemmer.stem(noSWText)
}
