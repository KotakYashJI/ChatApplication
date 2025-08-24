import mongoose from "mongoose";

async function dbconnect() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("DB Connected");
    } catch (error) {
        console.log(error);
    }
}

export default dbconnect;