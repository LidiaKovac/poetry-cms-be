import endpoints from "express-list-endpoints"
import mongoose, { ConnectOptions } from "mongoose"
import server from "./server.js"
const { MONGO_URL, PORT } = process.env

const options = {
  useNewUrlParser: true,
} as ConnectOptions

mongoose.connect(MONGO_URL + "poetry", options).then(() => console.log("š The server has successfully connected to mongodb."))
  .then(() => {
    server.listen(PORT, () => {
      console.log("š Server has started on port " + PORT + "!" + " \nš The server has these endpoints: \n");
      console.table(endpoints(server));
    });
  })
  .catch((e) => {
    console.log("ā CONNECTION FAILED! Error: ", e);
  });