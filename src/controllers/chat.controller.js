import chatmodel from "../models/chat.model.js"

export const createchat = async (req, res) => {
    try {
        const user = req.user;
        const { title } = req.body;
        const newchat = await chatmodel.create({
            user: user,
            title: title
        });
        res.status(201).json({
            message: "new chat added",
            newchat
        })
    } catch (error) {
        res.status(500).json({
            message: error
        })
    }
}