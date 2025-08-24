import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    }
}, {
    timestamp: true
}
);

const chatModel = mongoose.model("chats", chatSchema);

export default chatModel;