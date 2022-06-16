import mongoose from "mongoose"

const poemSchema = new mongoose.Schema({
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
    tags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }]
})

export default mongoose.model("Poem", poemSchema)