"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const supertest_1 = __importDefault(require("supertest"));
const server_js_1 = __importDefault(require("../server.js"));
const schema_1 = __importDefault(require("../services/poetry/schema"));
dotenv_1.default.config();
const validBody = {
    author: "Author Name",
    title: "Poem Title",
    text: "Poem",
    source: "Book",
};
const invalidBody = {
    author: "Author Name",
    title: "Poem Title",
    text: "Poem",
};
let postedId;
describe("TESTS:", () => {
    beforeAll((done) => {
        mongoose_1.default.connect(process.env.MONGO_URL + "test", {
            useNewUrlParser: true,
            // useUnifiedTopology: true,
        }, () => {
            console.log("🧪 INITIATING TEST MODE 🧪");
            done();
        });
    });
    afterAll((done) => {
        schema_1.default.deleteMany().then(() => {
            mongoose_1.default.connection.close().then(() => {
                done();
            });
        });
    });
    it("1. That POST / with valid body gives 201 status", (done) => {
        supertest_1.default(server_js_1.default)
            .post("/poems")
            .send(validBody)
            .then((response) => {
            postedId = response.body._id;
            expect(response.status).toBe(201);
        })
            .finally(() => done());
    });
    it("2. That POST / with INVALID body gives 400", (done) => {
        supertest_1.default(server_js_1.default)
            .post("/poems")
            .send(invalidBody)
            .then((response) => expect(response.status).toBe(400))
            .finally(() => done());
    });
    it("3. That POST /html with VALID test file gives 201", (done) => {
        supertest_1.default(server_js_1.default)
            .post("/poems/html?author=AuthorName")
            .attach("html", "__tests__/testpoem.html")
            .field("src", "Book")
            .field("year", "2000")
            .then((response) => expect(response.status).toBe(201))
            .finally(() => done());
    });
    it("3b. That POST /html with INVALID test file gives 400", (done) => {
        supertest_1.default(server_js_1.default)
            .post("/poems/html?author=AuthorName")
            .attach("html", "__tests__/broken.html")
            .then((response) => expect(response.status).toBe(400))
            .finally(() => done());
    });
    it("4. That POST /text with VALID test file gives 201", (done) => {
        supertest_1.default(server_js_1.default)
            .post("/poems/text?author=AuthorName")
            .attach("txt", "__tests__/testpoem.txt")
            .field("src", "Book")
            .field("year", "2000")
            .then((response) => expect(response.status).toBe(201))
            .finally(() => done());
    });
    it("4b. That POST /text with INVALID test file gives 400", (done) => {
        supertest_1.default(server_js_1.default)
            .post("/poems/text?author=AuthorName")
            .attach("txt", "__tests__/testpoem.txt")
            .field("src", "Book")
            .field("year", "2000")
            .then((response) => expect(response.status).toBe(201))
            .finally(() => done());
    });
    it("5. That GET /count gives us back a number", (done) => {
        supertest_1.default(server_js_1.default)
            .get("/poems/count")
            .then((response) => {
            expect(typeof response.body.count).toBe(typeof 10);
        })
            .finally(() => done());
    });
    it("6. That GET / gives us back an array of at least one valid item", (done) => {
        supertest_1.default(server_js_1.default)
            .get("/poems?sort=year_asc&page=1&size=15")
            .then((response) => {
            expect(response.body[0]._id).toBeTruthy();
        })
            .finally(() => done());
    });
    it("6b. That GET / with no query params gives back 400", (done) => {
        supertest_1.default(server_js_1.default)
            .get("/poems")
            .then((response) => {
            expect(response.status).toBe(400);
        })
            .finally(() => done());
    });
    it("7. That GET /single/:id gives us back a single element", (done) => {
        supertest_1.default(server_js_1.default)
            .get("/poems/single/" + postedId)
            .then((response) => {
            expect(response.status).toBe(200);
        })
            .finally(() => done());
    });
    it("8. That PUT /single/:id gives us back 200 AND the edited object", (done) => {
        supertest_1.default(server_js_1.default)
            .put("/poems/single/" + postedId)
            .send({ title: "EDITED" })
            .then((response) => {
            expect(response.status).toBe(200);
            expect(response.body.title).toBe("EDITED");
        })
            .finally(() => done());
    });
});
