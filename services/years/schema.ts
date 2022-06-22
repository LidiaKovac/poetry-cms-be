import mongoose from "mongoose"

const yearSchema = new mongoose.Schema({
  year: { type: String, required: true, unique: true },
  tags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
  poems: [{ type: mongoose.Types.ObjectId, ref: 'Poem' }]
})

export default mongoose.model("Year", yearSchema)
