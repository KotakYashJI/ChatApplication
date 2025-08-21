import mongoose from "mongoose";

const userschema = mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const usermodel = mongoose.model("users", userschema);

export default usermodel;