"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const poemSchema = new mongoose_1.default.Schema({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: false
    },
    tags: [{ type: mongoose_1.default.Types.ObjectId, ref: 'Tag' }],
}, { collection: "poems_v2" });
exports.default = mongoose_1.default.model("Poem", poemSchema);
