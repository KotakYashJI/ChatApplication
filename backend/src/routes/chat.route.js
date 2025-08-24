import express from "express"
import { createchat } from "../controllers/chat.controller.js";
import { authuser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/",authuser,createchat);

export default router;