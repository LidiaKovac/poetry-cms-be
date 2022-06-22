import mongoose from "mongoose"
import dotenv from "dotenv"
import supertest from "supertest"
import server from "../server.js"
import Poem from "../services/poetry/schema"
dotenv.config()

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

let postedId

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
    Poem.deleteMany().then(() => {
      mongoose.connection.close().then(() => {
        done()
      })
    })
  })
  it("1. That POST / with valid body gives 201 status", (done) => {
    supertest(server)
      .post("/poems")
      .send(validBody)
      .then((response) => {
        postedId = response.body._id
        expect(response.status).toBe(201)
      })

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
  it("5. That GET /count gives us back a number", (done) => {
    supertest(server)
      .get("/poems/count")
      .then((response) => {
        expect(typeof response.body.count).toBe(typeof 10)
      })

      .finally(() => done())
  })
  it("6. That GET / gives us back an array of at least one valid item", (done) => {
    supertest(server)
      .get("/poems")
      .then((response) => {
        expect(response.body[0]._id).toBeTruthy()
      })
      .finally(() => done())
  })
  it("7. That GET /single/:id gives us back a single element", (done) => {
    supertest(server)
      .get("/poems/single/" + postedId)
      .then((response) => {
        expect(response.status).toBe(200)
      })
      .finally(() => done())
  })
  it("8. That PUT /single/:id gives us back 200 AND the edited object", (done) => {
    supertest(server)
      .put("/poems/single/" + postedId)
      .send({title: "EDITED"})
      .then((response) => {
        // console.log(response);
        expect(response.status).toBe(200)
        expect(response.body.title).toBe("EDITED")
      })
      .finally(() => done())
  })
})
