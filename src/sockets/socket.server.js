import { Server } from "socket.io"
import { textgenerator, texttovector } from "../services/ai.service.js"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import usermodel from "../models/auth.model.js"
import messagemodel from '../models/message.model.js'
import { createMemory, queryMemory } from "../services/vector.service.js"

export const socketserver = (httpserver) => {
    const io = new Server(httpserver);

    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie) || "";
        if (!cookies.token) next(new Error("Authentication error : no token provided"));
        try {
            const user = jwt.verify(cookies.token, process.env.JWT_TOKEN);
            const existuser = await usermodel.findOne({ _id: user.id });
            socket.user = existuser;
            next();
        } catch (error) {
            next(new Error(error));
        }
    })

    io.on("connection", (socket) => {

        socket.on("disconnect", () => {
            console.log("A user is disconnected");
        });

        socket.on("ai-message", async (data) => {
            const message = await messagemodel.create({
                user: socket.user._id,
                chat: data.chat,
                content: data.content,
                role: "user"
            });

            const vectors = await texttovector(data.content);

            const memory = await queryMemory({
                queryvector: vectors,
                limit: 3,
                metadata: {
                    user: socket.user._id
                }
            });

            await createMemory({
                vectors: vectors,
                messageId: message._id,
                metadata: {
                    chat: data.chat,
                    user: socket.user._id,
                    text: message.content
                }
            });

            const chathistory = (await messagemodel.find({
                chat: data.chat
            }).sort({ createdAt: -1 }).limit(10).lean()).reverse();

            const stm = chathistory.map((item) => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            })

            const ltm = [{
                role: "user",
                parts: [{
                    text: `
                    these are some previous message from the chat, use them to generate response

                    ${memory.map((item) =>
                        item.metadata.text
                    ).join("/n")}
                    `
                }]
            }];

            const response = await textgenerator([...ltm, ...stm]);

            const responsemessage = await messagemodel.create({
                user: socket.user._id,
                chat: data.chat,
                content: response,
                role: "model"
            });

            const responsevector = await texttovector(response);

            await createMemory({
                vectors: responsevector,
                messageId: responsemessage._id,
                metadata: {
                    chat: data.chat,
                    user: socket.user._id,
                    text: response
                }
            });

            socket.emit("ai-response", {
                content: response,
                chat: data.chat
            });
        })
    })
}