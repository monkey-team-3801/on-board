import express, { Request, Response, NextFunction, Express } from "express";
import { createServer, Server } from "http";
import socketIO from "socket.io";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";

import { asyncHandler } from "./utils";
import { Database } from "./database";
import {
    RoomEvent,
    PrivateRoomJoinData,
    ChatEvent,
    ChatMessageSendType,
    AnnouncementEvent,
} from "../events";

import {
    healthCheckRoute,
    chatRoute,
    sessionRoute,
    courseRoute,
    authRoute,
    jobRoute,
    fileRoute,
} from "./routes";
import { userRoute } from "./routes";
import { ScheduleHandler } from "./jobs";

dotenv.config();

const app: Express = express();
const server: Server = createServer(app);
export const io: socketIO.Server = socketIO(server, { serveClient: false });

io.on("connect", (socket: SocketIO.Socket) => {
    socket.on(RoomEvent.PRIVATE_ROOM_JOIN, (data: PrivateRoomJoinData) => {
        socket.join(data.sessionId);
    });
    socket.on(ChatEvent.CHAT_MESSAGE_SEND, (data: ChatMessageSendType) => {
        // Emit ONLY to others
        socket.to(data.sessionId).emit(ChatEvent.CHAT_MESSAGE_RECEIVE, data);
    });
    socket.on(
        AnnouncementEvent.COURSE_ANNOUNCEMENTS_SUBSCRIBE,
        (data: { courses: Array<string> }) => {
            socket.leaveAll();
            data.courses.forEach((course) => {
                socket.join(`${course}_ANNOUNCEMENT`);
            });
        }
    );
});

app.use(bodyParser.json());
app.use(fileUpload());

// Request initialiser
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type, Authorization"
    );
    next();
});

app.get(
    "/file",
    asyncHandler<{}, { sessionId: string; fileId: string }>(
        async (req, res) => {
            res.status(503).end();
            // const session = await Session.findById(req.params.sessionId);
            // const file = session?.files?.get(req.params.fileId);
            // const contents = file?.file;
            // console.log("contents", contents);

            // res.set(
            //     "Content-disposition",
            //     `attachment; filename=${file?.filename}`
            // );
            // res.set("Content-Type", file?.fileExtension);
            // res.status(500);
            // res.end(contents);
        }
    )
);

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

// Authorisation routes.
app.use("/auth", authRoute);

// Job routes.
app.use("/job", jobRoute);

app.use("/filehandler", fileRoute);

// TODO API Routes
app.use(
    "/api",
    asyncHandler(async (req, res, next) => {})
);

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.json({
        message: err.message,
    }).end();
});

// Catch-all route
app.use("*", (req: Request, res: Response, next: NextFunction) => {
    res.sendFile("index.html", {
        root: "build",
    });
});

const database: Database = new Database(process.env.MONGODB_URI);
database.connect().then(() => {
    server.listen(process.env.PORT || 5000, async () => {
        const scheduleHandler = ScheduleHandler.getInstance();
        // Queue all existing jobs.
        await scheduleHandler.queueExistingJobs();
        console.log("Server is listening on", process.env.PORT || 5000);
    });
});
