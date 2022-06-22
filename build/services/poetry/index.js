"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poemRoute = void 0;
const express_1 = require("express");
const index_js_1 = require("../../utils/index.js");
const multer_1 = __importDefault(require("multer"));
const schema_js_1 = __importDefault(require("./schema.js"));
const schema_js_2 = __importDefault(require("../tags/schema.js"));
exports.poemRoute = express_1.Router();
exports.poemRoute.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let defaultSize = 15;
        let { sort, title, source, tags, page, size } = req.query;
        if (!sort || !page || !size) {
            res.status(400).send("sort, page and size params are required!");
        }
        else {
            let field;
            let order;
            if (sort) {
                field = sort.split("_")[0];
                order = sort.split("_")[1] === "asc" ? 1 : -1;
            }
            console.log({
                sort: sort ? { _id: 1, [field]: order } : { _id: 1 },
                skip: (Number(size) * (Number(page) - 1)) || 0,
                limit: Number(size) || defaultSize,
            });
            schema_js_1.default.find({
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
                if (err)
                    res.send(500, err);
                else
                    res.send(poems);
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.poemRoute.get("/count", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let count = yield schema_js_1.default.count();
        res.send({ count });
    }
    catch (error) {
        next(error);
    }
}));
exports.poemRoute.get("/single/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { id } = req.params;
        let poem = yield schema_js_1.default.findById(id).populate({
            path: "tags",
            select: ["word", "color"],
        });
        console.log(poem);
        if (poem === null) {
            res.status(204).send();
        }
        else {
            res.send(poem);
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
exports.poemRoute.put("/single/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { id } = req.params;
        console.log(req.body);
        let poem = yield schema_js_1.default.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
        // console.log(poem);
        if (poem._id)
            res.send(poem);
        else
            res.status(400).send("Something went wrong");
    }
    catch (error) {
        next(error);
    }
}));
exports.poemRoute.post("/stats", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Grab some coffee, this might take a while!");
    try {
        let poems = yield schema_js_1.default.find();
        let tags = yield schema_js_2.default.find();
        console.log("Phase 1, resetting the counter...");
        for (const poem of poems) {
            poem.tags = [];
            yield poem.save();
        }
        for (const tag of tags) {
            tag.overallOccurences = 0;
            yield tag.save();
        }
        console.log("Phase 1 ✅");
        console.log("Phase 2, counting and creating tags...");
        for (const poem of poems) {
            let words = index_js_1.cleanText(poem.text.toLowerCase());
            for (const word of words) {
                let tags = yield schema_js_2.default.find();
                let wordsOnly = tags.map((t) => t.word); //makes an array of all the words in the db already
                //checks if the tag is already in the database
                if (wordsOnly.includes(word)) {
                    //if the world exists already
                    let foundWord = yield schema_js_2.default.findOne({ word });
                    foundWord.overallOccurences += 1;
                    yield foundWord.save();
                }
                else {
                    let newTag = yield new schema_js_2.default({
                        word,
                        overallOccurences: 1,
                        yearlyOccurences: [],
                        color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, .3 )`,
                    });
                    yield newTag.save();
                }
                for (const tag of tags) {
                    if (words.includes(tag.word) && !poem.tags.includes(tag._id)) {
                        poem.tags.push(tag._id);
                        yield poem.save();
                    }
                }
            }
        }
        console.log("Phase 2 ✅");
        res.send("done ✅");
    }
    catch (error) {
        next(error);
    }
}));
exports.poemRoute.get("/stats", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let stats = yield schema_js_2.default.find().sort({ occurences: -1 });
        res.send(stats);
    }
    catch (error) {
        next(error);
    }
}));
exports.poemRoute.post("/stats/years", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Grab some coffee, this might take a while!");
        console.log("Phase 1, resetting the counter and dividing by year...");
        let results = {};
        let poems = yield schema_js_1.default.find();
        for (const poem of poems) {
            poem.yearlyOccurences = [];
            poem.save();
        }
        let poemsByYear = yield schema_js_1.default.aggregate([
            {
                $group: {
                    _id: "$_id",
                    year: { $first: "$year" },
                    poems: {
                        $push: "$$ROOT",
                    },
                },
            },
        ]);
        console.log("Phase 1 ✅");
        console.log("Phase 2, counting...");
        for (const year of poemsByYear) {
            for (const poem of year.poems) {
                for (const tagId of poem.tags) {
                    let tag = yield schema_js_2.default.findById(tagId);
                    if (tag.yearlyOccurences.filter((t) => t.year === year.year).length > 0) {
                        let words = index_js_1.cleanText(poem.text.toLowerCase());
                        let counter = 0;
                        words.forEach((w) => {
                            if (w === tag.word) {
                                counter++;
                            }
                            console.log(counter);
                        });
                        for (const tagYear of tag.yearlyOccurences) {
                            if (tagYear.year === year.year) {
                                console.log(tagYear.year, year.year);
                                tagYear.occurences = counter;
                                console.log(tagYear);
                            }
                        }
                    }
                    else {
                        tag.yearlyOccurences.push({ year: year.year, occurences: 1 });
                    }
                    // console.log(tag);
                    yield tag.save();
                }
            }
        }
        console.log("Phase 2 ✅");
        res.send(poemsByYear);
    }
    catch (error) {
        next(error);
    }
}));
exports.poemRoute.get("/stats/years", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //group by year
        let poemsByYear = yield schema_js_1.default.aggregate([
            {
                $group: {
                    // _id: "$_id",
                    _id: "$year",
                    poems: {
                        $push: "$$ROOT",
                    },
                },
            },
        ]);
        let cleanPoems = poemsByYear.map((poem) => {
            poem.year = poem._id;
            delete poem._id;
            return poem;
        });
        res.send(cleanPoems);
    }
    catch (error) {
        next(error);
    }
}));
exports.poemRoute.get("/stats/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let poem = yield schema_js_1.default.findById(req.params.id);
        let results = {};
        let words = index_js_1.cleanText(poem.text.toLowerCase());
        for (const word of words) {
            if (Object.keys(results).includes(word)) {
                //if the word was already added
                results[word].occurences += 1;
            }
            else {
                results[word] = {
                    occurences: 1,
                    color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, .3 )`,
                };
                // results[word].color = `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, .5 )`
            }
        }
        let listedResults = [];
        for (const res of Object.keys(results)) {
            listedResults.push({
                word: res,
                occurences: results[res].occurences,
                color: results[res].color,
            });
        }
        listedResults.sort((a, b) => b.occurences - a.occurences);
        res.send(listedResults);
    }
    catch (error) {
        next(error);
    }
}));
exports.poemRoute.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let title = index_js_1.getCapitalizedName(req.body.title);
        let newPoem = new schema_js_1.default(Object.assign(Object.assign({}, req.body), { title }));
        let { _id } = yield newPoem.save();
        // const ok = await newPoem.save()
        res.status(201).send({ _id });
    }
    catch (error) {
        if (error.name.includes("ValidationError")) {
            res.status(400).send(error.errors);
        }
        else
            res.send(500);
    }
}));
exports.poemRoute.post("/text", multer_1.default().fields([{ name: "txt" }, { name: "src" }, { name: "year" }]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { files } = req;
        let added = [];
        let counter = 0;
        for (const file of files.txt) {
            let fileToString = file.buffer.toString();
            let title;
            let text;
            if (fileToString.length <= 0)
                continue;
            fileToString = fileToString.replaceAll("\\r", "\\n");
            if (fileToString.includes("<big>")) {
                title = index_js_1.getCapitalizedName(fileToString.split("<big>")[1].split("</big>")[0]);
            }
            else if (fileToString.includes("<h1>")) {
                title = index_js_1.getCapitalizedName(fileToString.split("<h1>")[1].split("</h1>")[0]);
            }
            else if (fileToString.includes("<b>")) {
                title = index_js_1.getCapitalizedName(fileToString.split("<b>")[1].split("</b>")[0]);
            }
            else {
                title = (fileToString === null || fileToString === void 0 ? void 0 : fileToString.split("\n")[0]) || "Untitled";
            }
            if (fileToString.includes("<poem>")) {
                text = fileToString.split("<poem>")[1].split("</poem>")[0];
            }
            else if (fileToString.length > 0) {
                text = fileToString.replaceAll("<sp>", "").replaceAll("</sp>", "");
            }
            let newPoem = new schema_js_1.default({
                author: req.query.author,
                text: text,
                title,
                source: req.body.src,
                year: req.body.year,
            });
            yield newPoem.save();
            added.push(newPoem._id);
            counter += 1;
        }
        res.status(201).send({ added, counter });
    }
    catch (error) {
        next(error);
    }
}));
exports.poemRoute.post("/html", multer_1.default().fields([{ name: "html" }, { name: "src" }, { name: "year" }]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { files } = req;
        let added = [];
        let counter = 0;
        for (const file of files.html) {
            let fileToString = file.buffer.toString();
            if (fileToString.includes("<h1>" && "<p>")) {
                let title = fileToString.split("<h1>")[1].split("</h1>")[0];
                let text = fileToString
                    .split("<p>")[1]
                    .split("</p>")[0]
                    .replaceAll("<p>", "<br><br>")
                    .replaceAll("<br>", "\n")
                    .replaceAll("<br/ >", "\n");
                let newPoem = new schema_js_1.default({
                    author: req.query.author,
                    text: text,
                    title,
                    source: req.body.src,
                    year: req.body.year,
                });
                yield newPoem.save();
                added.push(newPoem._id);
                counter += 1;
                res.status(201).send({ added, counter });
            }
            else
                res
                    .status(400)
                    .send({ message: "HTML must contain an <h1> and a <p>" });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.poemRoute.put("/clean", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let allPoems = yield schema_js_1.default.find();
        allPoems.forEach((p) => {
            p.text = p.text
                .replaceAll("<br", "\n")
                .replaceAll("<br>", "\n")
                .replaceAll("<br/ >", "\n")
                .replaceAll("<br/>", "\n")
                .replaceAll("/>", "\n");
            p.title = index_js_1.getCapitalizedName(p.title);
            p.save();
        });
        res.send("done");
    }
    catch (error) { }
}));
exports.poemRoute.delete("/single/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield schema_js_1.default.findByIdAndDelete(req.params.id);
        res.send(204);
    }
    catch (error) {
        next(error);
    }
}));
