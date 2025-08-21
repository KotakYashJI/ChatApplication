import usermodel from "../models/auth.model.js";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

export const registeruser = async (req, res) => {
    const { fullname, email, password } = req.body;
    const isuser = await usermodel.findOne({ email });
    
    if (isuser) return res.status(400).json({
        message: "User Alredy Exist!"
    });

    const hashpassword = await bcryptjs.hash(password, 10);
    const newuser = await usermodel.create({
        fullname: fullname,
        email: email,
        password: hashpassword
    });

    const usertoken = { id: newuser._id };
    const token = jwt.sign(usertoken, process.env.JWT_TOKEN);
    res.cookie("token", token);
    req.user = newuser;
    res.status(201).json({
        message: "User Register Successfully",
        newuser
    })
}

export const loginuser = async (req, res) => {
    const { email, password } = req.body;

    const userexist = await usermodel.findOne({
        email: email
    });

    if (!userexist) return res.status(400).json({
        message: "User Not Found!"
    });

    const ispassword = await bcryptjs.compare(password, userexist.password);

    if (!ispassword) return res.status(400).json({
        message: "Invalid Password"
    });

    const usertoken = { id: userexist._id };

    const token = jwt.sign(usertoken, process.env.JWT_TOKEN);

    res.cookie("token", token);

    req.user = userexist;

    res.status(200).json({
        message: "User Login Successfully",
        userexist
    })
}