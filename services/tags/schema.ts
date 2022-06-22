import mongoose from "mongoose"

const tagSchema = new mongoose.Schema<ITag>({
  word: { type: String, required: true, unique: true },
  color: { type: String, required: true },
  overallOccurences: { type: Number, required: true },
  yearlyOccurences: [{ year: String, occurences: Number }],
})

export default mongoose.model<ITag>("Tag", tagSchema) as mongoose.Model<ITag>
