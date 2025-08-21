import mongoose from "mongoose"

const messageSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat"
    },
    content: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "model"],
        default: "user",
        required: true
    }
},
    {
        timestamps: true
    }
)

const messagemodel = mongoose.model("message", messageSchema);

export default messagemodel;