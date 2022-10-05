import mongoose from "mongoose"

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    googleID: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        required: true
    }
    
})

export default mongoose.model<IUser>("User", userSchema) as mongoose.Model<IUser>