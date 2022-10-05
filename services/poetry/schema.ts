import { MongoServerClosedError } from "mongodb"
import mongoose from "mongoose"

const poemSchema = new mongoose.Schema<IPoem>({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: false
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    userID: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }

}, { collection: "poems_v2" })

export default mongoose.model<IPoem>("Poem", poemSchema) as mongoose.Model<IPoem>