"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_js_1 = __importDefault(require("./server.js"));
const { MONGO_URL, PORT } = process.env;
const options = {
    useNewUrlParser: true,
};
mongoose_1.default.connect(MONGO_URL + "poetry", options).then(() => console.log("🌚 The server has successfully connected to mongodb."))
    .then(() => {
    server_js_1.default.listen(PORT, () => {
        console.log("🌚 Server has started on port " + PORT + "!" + " \n🌝 The server has these endpoints: \n");
        console.table(express_list_endpoints_1.default(server_js_1.default));
    });
})
    .catch((e) => {
    console.log("❌ CONNECTION FAILED! Error: ", e);
});
