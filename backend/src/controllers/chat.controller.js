import chatmodel from "../models/chat.model.js"

export const createchat = async (req, res) => {
    const { text } = req.body;
    try {
        const newchat = await chatmodel.create({
            text: text,
            user: req.user._id
        });
        res.status(201).json({
            message: "Chat created",
            newchat
        });
    } catch (error) {
        res.status(500).json({
            message: error
        });
    }
}