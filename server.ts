import express from "express"
import cors from "cors"

import { poemRoute } from "./services/poetry/index.js"
import dotenv from "dotenv"

dotenv.config()


const server = express()
server.use(cors())
server.use(express.json())

server.use("/poems", poemRoute)



export default server