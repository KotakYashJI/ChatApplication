import usermodel from "../models/user.model.js"
import jwt from "jsonwebtoken"

export const authuser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(400).json({
        message: "User not authenticate please login"
    });
    const user = jwt.verify(token, process.env.JWT_TOKEN);
    const isuser = await usermodel.findOne({ _id: user.id });
    if (!isuser) return res.status(404).json({
        message: "user not found please login"
    });
    req.user = isuser;
    next();
}