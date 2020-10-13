import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import fileUpload from "express-fileupload";
import { createServer, Server } from "http";
import { ExpressPeerServer } from "peer";
import socketIO from "socket.io";
import {
    AnnouncementEvent,
    CanvasEvent,
    ChatEvent,
    ChatMessageSendType,
    FileUploadEvent,
    PrivateVideoRoomJoinData,
    ResponseFormEvent,
    RoomEvent,
    VideoEvent,
    GlobalEvent,
} from "../events";
import { Database, SessionUsers } from "./database";
import { VideoSession } from "./database/schema/VideoSession";
import { ScheduleHandler } from "./jobs";
import {
    authRoute,
    chatRoute,
    courseRoute,
    fileRoute,
    healthCheckRoute,
    jobRoute,
    responseRoute,
    sessionRoute,
    userRoute,
    videoRoute,
} from "./routes";
import { asyncHandler } from "./utils";

dotenv.config();

const app: Express = express();
const server: Server = createServer(app);
export const io: socketIO.Server = socketIO(server, { serveClient: false });
const peerServer = ExpressPeerServer(server, {
    path: "/",
});

app.use("/peerServer", peerServer);

io.on("connect", (socket: SocketIO.Socket) => {
    // socket.on(RoomEvent.PRIVATE_ROOM_JOIN, (data: PrivateRoomJoinData) => {
    //     socket.join(data.sessionId);
    // });
    socket.on(ChatEvent.CHAT_MESSAGE_SEND, (data: ChatMessageSendType) => {
        // Emit ONLY to others
        socket.in(data.sessionId).emit(ChatEvent.CHAT_MESSAGE_RECEIVE, data);
    });

    socket.on(
        RoomEvent.SESSION_JOIN,
        async (data: PrivateVideoRoomJoinData) => {
            const { sessionId, userId } = data;
            const session = await SessionUsers.findOne({
                sessionId,
            });
            if (!session) {
                return;
            }
            socket.join(sessionId);
            if (session.userReferenceMap.has(userId)) {
                session.userReferenceMap.set(
                    userId,
                    (session.userReferenceMap.get(userId) ?? 0) + 1
                );
                await session.save();
            } else {
                session.userReferenceMap.set(userId, 1);
                await session.save();
                io.in(sessionId).emit(RoomEvent.SESSION_JOIN);
                io.emit(GlobalEvent.USER_ONLINE_STATUS_CHANGE);
            }
            console.log("User", userId, "joining", sessionId);
            socket.on("disconnect", async () => {
                const currentReference =
                    session.userReferenceMap.get(userId) ?? 1;
                console.log("User disconnect", userId);
                if (currentReference - 1 === 0) {
                    session.userReferenceMap.delete(userId);
                    await session.save();
                    socket.leave(sessionId);
                    io.in(sessionId).emit(RoomEvent.SESSION_LEAVE);
                    io.emit(GlobalEvent.USER_ONLINE_STATUS_CHANGE);
                    console.log("User", userId, "leaving", sessionId);
                } else {
                    session.userReferenceMap.set(
                        userId,
                        (session.userReferenceMap.get(userId) ?? 0) - 1
                    );
                    await session.save();
                }
            });
        }
    );
    // TODO: merge PrivateVideoRoomJoinData with PrivateRoomJoinData?
    socket.on(
        VideoEvent.USER_JOIN_ROOM,
        async (data: PrivateVideoRoomJoinData) => {
            const { sessionId, userId, peerId } = data;
            const session = await VideoSession.findOne({
                sessionId,
            });
            if (!session) {
                return;
            }
            if (session.userPeerMap.has(userId)) {
                session.userReferenceMap.set(
                    userId,
                    (session.userReferenceMap.get(userId) ?? 0) + 1
                );
                await session.save();
            } else {
                session.userPeerMap.set(userId, peerId);
                session.userReferenceMap.set(userId, 1);
                await session.save();
                socket.join(sessionId);
                socket
                    .in(sessionId)
                    .emit(VideoEvent.USER_JOIN_ROOM, { userId, peerId });
            }
            console.log("User", userId, "joining", sessionId, peerId);
            socket.on("disconnect", async () => {
                const currentReference =
                    session.userReferenceMap.get(userId) ?? 1;
                if (currentReference - 1 === 0) {
                    session.userPeerMap.delete(userId);
                    session.userReferenceMap.delete(userId);
                    await session.save();
                    io.in(sessionId).emit(VideoEvent.USER_LEAVE_ROOM, {
                        userId,
                        peerId,
                    });
                    console.log("User", userId, "leaving", sessionId);
                } else {
                    session.userReferenceMap.set(
                        userId,
                        (session.userReferenceMap.get(userId) ?? 0) - 1
                    );
                    await session.save();
                }
            });
        }
    );

    socket.on(
        RoomEvent.BREAKOUT_ROOM_ALLOCATE,
        (
            users: Array<string>,
            roomId: string,
            roomIndex: number,
            sessionId: string
        ) => {
            socket
                .to(sessionId)
                .emit(
                    RoomEvent.BREAKOUT_ROOM_ALLOCATE,
                    users,
                    roomIndex,
                    roomId
                );
        }
    );

    socket.on(RoomEvent.USER_HAND_STATUS_CHANGED, (sessionId) => {
        socket.to(sessionId).emit(RoomEvent.USER_HAND_STATUS_CHANGED);
    });

    // socket.on(
    //     VideoEvent.USER_LEAVE_ROOM,
    //     async ({ sessionId, peerId, userId }) => {
    //         if (peerId) {
    //             const session = await VideoSession.findOne({
    //                 sessionId,
    //             });
    //             if (!session) {
    //                 return;
    //             }
    //             session.userPeerMap.delete(userId);
    //             await session.save();
    //             io.in(sessionId).emit(VideoEvent.USER_LEAVE_ROOM, peerId);
    //             console.log("Peer", peerId, "disconnected", sessionId);
    //         }
    //     }
    // );

    socket.on(
        AnnouncementEvent.COURSE_ANNOUNCEMENTS_SUBSCRIBE,
        (data: { courses: Array<string> }) => {
            socket.leaveAll();
            data.courses.forEach((course) => {
                socket.join(`${course}_ANNOUNCEMENT`);
            });
        }
    );

    socket.on(CanvasEvent.DRAW, (data) => {
        socket.to(data.sessionId).emit(CanvasEvent.CHANGE, data.canvasData);
    });

    socket.on(CanvasEvent.CLEAR, (data) => {
        socket.to(data.sessionId).emit(CanvasEvent.CLEAR);
    });

    socket.on(ResponseFormEvent.NEW_FORM, (data) => {
        socket.to(data).emit(ResponseFormEvent.NEW_FORM);
    });

    socket.on(ResponseFormEvent.NEW_RESPONSE, (data) => {
        socket.to(data).emit(ResponseFormEvent.NEW_RESPONSE);
    });

    socket.on(FileUploadEvent.NEW_FILE, (data) => {
        socket.to(data).emit(FileUploadEvent.NEW_FILE);
    });

    socket.on(FileUploadEvent.FILE_DELETED, (data) => {
        socket.to(data).emit(FileUploadEvent.FILE_DELETED);
    });

    socket.on(ChatEvent.CHAT_JOIN, (chatId: string) => {
        socket.join(chatId);
    });

    socket.on(ChatEvent.CHAT_LEAVE, (chatId: string) => {
        socket.leave(chatId);
    });

    socket.on(
        ChatEvent.CHAT_NEW_PRIVATE_MESSAGE,
        (chatId: string, data: ChatMessageSendType) => {
            socket.to(chatId).emit(ChatEvent.CHAT_NEW_PRIVATE_MESSAGE, data);
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

// Base route
app.get(
    "/",
    asyncHandler(async (req, res, next) => {
        next();
    })
);

// Automatically serve the index.html file from the build folder
app.use("/", express.static("build"));

app.use("/public", express.static("public"));

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

// Job routes.
app.use("/job", jobRoute);

// File routes.
app.use("/filehandler", fileRoute);

// Response collection routes.
app.use("/response-handler", responseRoute);

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

        await SessionUsers.findOneAndUpdate(
            { sessionId: "global" },
            {
                sessionId: "global",
                userReferenceMap: new Map(),
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );
        // await VideoSession.updateMany(
        //     {},
        //     {
        //         $set: {
        //             userPeerMap: new Map(),
        //             userReferenceMap: new Map(),
        //         },
        //     }
        // );
        console.log("Server is listening on", process.env.PORT || 5000);
    });
});
