import express, { Express } from "express";
import { createServer, Server } from "http";
import socketIO from "socket.io";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import { asyncHandler } from "./utils";
import { Database } from "./database";

import { healthCheckRoute, chatRoute } from "./routes";
import { sessionRoute } from "./routes";

dotenv.config();

const app: Express = express();
const server: Server = createServer(app);
export const io: socketIO.Server = socketIO(server, { serveClient: false });

app.use(bodyParser.json());

// Request initialiser
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type, Authorization"
    );
    next();
});

// Base route
app.get(
    "/",
    asyncHandler(async (req, res, next) => {
        next();
    })
);

// Automatically serve the index.html file from the build folder
app.use("/", express.static("build"));

// Health check route.
app.use("/health", healthCheckRoute);

// Session routes.
app.use("/session", sessionRoute);

// Session routes.
app.use("/chat", chatRoute);

// TODO API Routes
app.use(
    "/api",
    asyncHandler(async (req, res, next) => {})
);

// Catch-all route
app.use("*", (req, res, next) => {
    res.sendFile("index.html", {
        root: "build",
    });
});

const database: Database = new Database(process.env.MONGODB_URI);
database.connect().then(() => {
    server.listen(process.env.PORT || 5000, async () => {
        console.log("Server is listening on", process.env.PORT || 5000);
    });
});
