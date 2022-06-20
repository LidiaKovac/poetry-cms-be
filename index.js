import endpoints from "express-list-endpoints"
import mongoose from "mongoose"
import server from "./server.js"
const {MONGO_URL, PORT} = process.env

mongoose.connect(MONGO_URL + "poetry", {
    useNewUrlParser: true,
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