import mongoose from "mongoose";

export const connectdb = async () => {
    const db = await mongoose.connect(process.env.MONGO_URL);
    try {
        if (db) {
            console.log(`database connected`);
        }
    } catch (error) {
        console.log(error);
    }
}