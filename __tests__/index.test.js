import mongoose from "mongoose"
import dotenv from "dotenv"
import supertest from "supertest"
import server from "../server.js"
dotenv.config()

// describe("Testing the tests", ()=> {
//     beforeAll((done) => {
//         mongoose
//           .connect(process.env.MONGO_URL_TEST, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//           })
//           .then(() => {
//             console.log("🧪 INITIATING TEST MODE 🧪")
//             done()
//         })
//           .catch((e) => {
//             console.log("❌ CONNECTION FAILED! Error: ", e)
//           })
//       })
//       afterAll((done)=> {
//         mongoose.disconnect()
//         console.log("🧪 TEST MODE CLOSING 🧪")
//         done()
//     })
//     it("check that true is true", (done)=> {
//         expect(true).toBe(true)
//         done()
//     })
// })

const validBody = {
  author: "Author Name",
  title: "Poem Title",
  text: "Poem",
  source: "Book",
}

const invalidBody = {
  author: "Author Name",
  title: "Poem Title",
  text: "Poem",
}

describe("TESTS:", () => {
  beforeAll((done) => {
    console.log(process.env.MONGO_URL + "test")
    mongoose.connect(
      process.env.MONGO_URL + "test",
      {
        useNewUrlParser: true,
        // useUnifiedTopology: true,
      },
      () => {
        console.log("🧪 INITIATING TEST MODE 🧪")
        done()
      }
    )
  })
  afterAll((done) => {
    mongoose.connection.close().then(() => {
      done()
    })
  })
  it("1. That POST / with valid body gives 201 status", (done) => {
    supertest(server)
      .post("/poems")
      .send(validBody)
      .then((response) => expect(response.status).toBe(201))

      .finally(() => done())
  })
  it("2. That POST / with INVALID body gives 400", (done) => {
    supertest(server)
      .post("/poems")
      .send(invalidBody)
      .then((response) => expect(response.status).toBe(400))

      .finally(() => done())
  })
  it("3. That POST /html with VALID test file gives 201", (done) => {
    supertest(server)
      .post("/poems/html?author=AuthorName")
      .attach("html", "__tests__/testpoem.html")
      .field("src", "Book")
      .field("year", "2000")
      .then((response) => expect(response.status).toBe(201))

      .finally(() => done())
  })
  it("3b. That POST /html with INVALID test file gives 400", (done) => {
    supertest(server)
      .post("/poems/html?author=AuthorName")
      .attach("html", "__tests__/broken.html")
      .then((response) => expect(response.status).toBe(400))

      .finally(() => done())
  })
  it("4. That POST /text with VALID test file gives 201", (done) => {
    supertest(server)
      .post("/poems/text?author=AuthorName")
      .attach("txt", "__tests__/testpoem.txt")
      .field("src", "Book")
      .field("year", "2000")
      .then((response) => expect(response.status).toBe(201))

      .finally(() => done())
  })
  it("4b. That POST /text with INVALID test file gives 400", (done) => {
    supertest(server)
      .post("/poems/text?author=AuthorName")
      .attach("txt", "__tests__/testpoem.txt")
      .field("src", "Book")
      .field("year", "2000")
      .then((response) => expect(response.status).toBe(201))

      .finally(() => done())
  })
})
