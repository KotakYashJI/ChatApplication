import usermodel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"

export const registeruser = async (req, res) => {
    const { fullname, email, password } = req.body;
    const user = await usermodel.findOne({
        $or: [
            { fullname: fullname },
            { email: email }
        ]
    });
    if (user) return res.status(400).json({
        message: "User Already Registered"
    })
    const hashpassword = await bcryptjs.hash(password, 10);
    try {
        const newuser = await usermodel.create({
            fullname: fullname,
            email: email,
            password: hashpassword,
        });
        const usertoken = { id: newuser._id };
        const token = jwt.sign(usertoken, process.env.JWT_TOKEN);
        res.cookie("token", token);
        req.user = newuser;
        res.status(201).json({
            message: "User register successfully",
            newuser
        });
    } catch (error) {
        res.status(500).json({
            message: error
        });
    }
}

export const loginuser = async (req, res) => {
    const { email, password } = req.body;
    const user = await usermodel.findOne({ email });
    if (!user) return res.status(404).json({
        message: "User not found please register"
    });
    const ispassword = await bcryptjs.compare(password, user.password);
    if (!ispassword) return res.status(400).json({
        message: "Invalid password"
    });
    const usertoken = { id: user._id };
    const token = jwt.sign(usertoken, process.env.JWT_TOKEN);
    res.cookie("token", token);
    req.user = user;
    res.status(200).json({
        message: "User login successfully",
        user
    });
}