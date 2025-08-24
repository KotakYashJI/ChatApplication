import mongoose from "mongoose";

const messageschema = mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chats"
    },
    text: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    lastactiviy: {
        type: Date,
        default: Date.now
    }
});

const messageModel = mongoose.model("messages", messageschema);

export default messageModel;