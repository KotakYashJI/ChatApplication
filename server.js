import { connectdb } from "./src/database/db.js";
import app from "./src/app.js";
import { createServer } from "http"
import { socketserver } from "./src/sockets/socket.server.js"

const port = process.env.PORT;
const httpserver = createServer(app);

connectdb();

socketserver(httpserver);

httpserver.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})