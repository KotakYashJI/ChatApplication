import express from "express"
import { authuser } from "../middleware/auth.middleware.js";
import { createchat } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", authuser, createchat);

export default router;