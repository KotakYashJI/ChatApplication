import usermodel from "../models/auth.model.js";
import jwt from "jsonwebtoken"

export const authuser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(400).json({
        message: "User not varified please login"
    });

    try {
        const user = jwt.verify(token, process.env.JWT_TOKEN);
        const isuserexist = await usermodel.findOne({
            _id: user.id
        });
        if (!isuserexist) return res.status(401).json({
            message: "User not found please register"
        });
        req.user = isuserexist;
        next();
    } catch (error) {
        res.status(500).json({
            message: error
        })
    }
}