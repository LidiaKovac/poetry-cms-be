"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanText = exports.getCapitalizedName = void 0;
const lang_sv_1 = require("@nlpjs/lang-sv");
const getCapitalizedName = (string) => {
    let words = string.split(" ");
    words = words.map((w) => w.toLowerCase());
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};
exports.getCapitalizedName = getCapitalizedName;
const cleanText = (text) => {
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
        .filter((word) => isNaN(word));
    let stemmer = new lang_sv_1.StemmerSv();
    stemmer.stopwords = new lang_sv_1.StopwordsSv();
    let noSWText = stemmer.stopwords.removeStopwords(cleanText);
    return stemmer.stem(noSWText);
};
exports.cleanText = cleanText;
