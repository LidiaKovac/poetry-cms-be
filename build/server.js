"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_js_1 = require("./services/poetry/index.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server = express_1.default();
server.use(cors_1.default());
server.use(express_1.default.json());
server.use("/poems", index_js_1.poemRoute);
exports.default = server;
