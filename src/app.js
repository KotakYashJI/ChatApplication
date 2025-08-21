import express from 'express'
import dotenv from "dotenv"
import cookieParser from 'cookie-parser'
import Authroute from "./routes/auth.route.js"
import Chatroute from "./routes/chat.route.js"

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth",Authroute);

app.use("/api/chat",Chatroute);

export default app;