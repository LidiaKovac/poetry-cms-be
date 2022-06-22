"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const tagSchema = new mongoose_1.default.Schema({
    word: { type: String, required: true, unique: true },
    color: { type: String, required: true },
    overallOccurences: { type: Number, required: true },
    yearlyOccurences: [{ year: String, occurences: Number }],
});
exports.default = mongoose_1.default.model("Tag", tagSchema);
