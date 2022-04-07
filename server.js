import express from "express"
import cors from "cors"
import endpoints from "express-list-endpoints"
import mongoose from "mongoose"
import dotenv from "dotenv"
import { poemRoute } from "./services/poetry/index.js"

dotenv.config()
const {MONGO_URL, PORT} = process.env

const server = express()
server.use(cors())
server.use(express.json())

server.use("/poems", poemRoute)

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=> console.log("🌚 The server has successfully connected to mongodb."))
.then(() => {
    server.listen(PORT, () => {
      console.log("🌚 Server has started on port " + PORT + "!" + " \n🌝 The server has these endpoints: \n");
      console.table(endpoints(server));
    });
  })
  .catch((e) => {
    console.log("❌ CONNECTION FAILED! Error: ", e);
  });

export default server