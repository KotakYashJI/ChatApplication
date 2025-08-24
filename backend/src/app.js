import express from "express"
import dotenv from "dotenv"
import Userroute from "./routes/user.route.js"
import Chatroute from "./routes/chat.route.js"
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/user", Userroute);
app.use("/api/chat", Chatroute);

export default app;