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
        type: String,
        required: false
    }
})

export default mongoose.model("Poem", poemSchema)