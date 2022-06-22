"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const yearSchema = new mongoose_1.default.Schema({
    year: { type: String, required: true, unique: true },
    tags: [{ type: mongoose_1.default.Types.ObjectId, ref: 'Tag' }],
    poems: [{ type: mongoose_1.default.Types.ObjectId, ref: 'Poem' }]
});
exports.default = mongoose_1.default.model("Year", yearSchema);
