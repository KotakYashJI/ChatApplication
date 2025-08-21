import mongoose from "mongoose";

const chatshema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    lastactivity: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
}
)

const chatmodel = mongoose.model("chats", chatshema);

export default chatmodel;