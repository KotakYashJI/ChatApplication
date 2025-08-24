import app from "./src/app.js";
import dbconnect from "./src/database/db.js"
import { createServer } from "http"
import { socketserver } from "./src/sockets/socket.data.js";

const port = process.env.PORT;

dbconnect();

const httpserver = createServer(app);
socketserver(httpserver);

httpserver.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});