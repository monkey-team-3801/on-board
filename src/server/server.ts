import express, { Express } from "express";
import { createServer, Server } from "http";
import socketIO from "socket.io";
import { PeerServer } from "peer";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import { asyncHandler } from "./utils";
import { Database } from "./database";
import {
    RoomEvent,
    PrivateRoomJoinData,
    ChatEvent,
    ChatMessageSendType,
    VideoEvent,
    PrivateVideoRoomJoinData,
} from "../events";

import {
    healthCheckRoute,
    chatRoute,
    sessionRoute,
    courseRoute,
    authRoute, videoRoute
} from "./routes";
import { userRoute } from "./routes";
import { ScheduleHandler } from "./jobs";

dotenv.config();

const app: Express = express();
const server: Server = createServer(app);
export const io: socketIO.Server = socketIO(server, { serveClient: false });

const peerServer = PeerServer({
    path: "/",
    port: 5001,
});

app.use("/", peerServer);

io.on("connect", (socket: SocketIO.Socket) => {
    socket.on(RoomEvent.PRIVATE_ROOM_JOIN, (data: PrivateRoomJoinData) => {
        socket.join(data.sessionId);
    });
    socket.on(ChatEvent.CHAT_MESSAGE_SEND, (data: ChatMessageSendType) => {
        // Emit ONLY to others
        socket.to(data.sessionId).emit(ChatEvent.CHAT_MESSAGE_RECEIVE, data);
    });
    // TODO: merge PrivateVideoRoomJoinData with PrivateRoomJoinData?
    socket.on(VideoEvent.USER_JOIN_ROOM, (data: PrivateVideoRoomJoinData) => {
        socket.join(data.sessionId);
        socket.to(data.sessionId).emit(VideoEvent.USER_JOIN_ROOM);
    });
});

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

// Chat routes.
app.use("/chat", chatRoute);

// Login and Registration routes.
app.use("/user", userRoute);

// Course routes.
app.use("/courses", courseRoute);

// Video routes.
app.use("/videos", videoRoute);

// Authorisation routes.
app.use("/auth", authRoute);

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
        const scheduleHandler = new ScheduleHandler();
        // Queue all existing jobs.
        await scheduleHandler.queueExistingJobs();
        console.log("Server is listening on", process.env.PORT || 5000);
    });
});
