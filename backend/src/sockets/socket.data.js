import { Server } from "socket.io"
import { getaianswer } from "../services/ai.service.js";

export const socketserver = (httpserver) => {
    const io = new Server(httpserver);

    io.on("connection", (socket) => {
        console.log("A User is connected", socket.id);

        socket.on("disconnect", () => {
            console.log("A User is disconnected");
        });

        socket.on("ai-message", async (data) => {
            const ans = await getaianswer(data.message);
            socket.emit("ai-response", ans);
        });

    })
}