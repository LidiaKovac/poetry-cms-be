import express from "express"
import cors from "cors"
import session from "express-session"
import passport from "passport"
import parser from "cookie-parser"

import { poemRoute } from "./services/poetry/index.js"
import { userRoute } from "./services/user/index.js"

import { passportInit } from "./utils/auth.js"

import dotenv from "dotenv"

dotenv.config()
passportInit()
passport.initialize()
passport.session()

const server = express()

server.use(cors())
server.use(express.json())
server.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
server.use(parser())

server.use("/poems", poemRoute)
server.use("/user", userRoute)




export default server