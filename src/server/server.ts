import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
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
    PrivateVideoRoomShareScreenData,
    PrivateVideoRoomStopSharingData,
    PrivateVideoRoomForceStopSharingData,
} from "../events";
import { ClassroomSession, Database, SessionUsers, User } from "./database";
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
    userNoAuthRoute,
    fileNoAuthRoute,
} from "./routes";
import { asyncHandler } from "./utils";
import { UserType } from "../types";
// Environment environment variables.
dotenv.config();

// Initialisation.
const app: Express = express();
const server: Server = createServer(app);

// Connect socketIO and PeerJs to the express server.
export const io: socketIO.Server = socketIO(server, {
    serveClient: false,
    upgradeTimeout: 30000,
});
const peerServer = ExpressPeerServer(server, {
    path: "/",
});

app.use("/peerServer", peerServer);

// SocketIO events.
io.on("connect", (socket: SocketIO.Socket) => {
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
            socket.on("disconnect", async () => {
                const currentReference =
                    session.userReferenceMap.get(userId) ?? 1;
                if (currentReference - 1 === 0) {
                    session.userReferenceMap.delete(userId);
                    await session.save();
                    socket.leave(sessionId);
                    io.in(sessionId).emit(RoomEvent.SESSION_LEAVE);
                    io.emit(GlobalEvent.USER_ONLINE_STATUS_CHANGE);
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
                socket.in(sessionId).emit(VideoEvent.USER_JOIN_ROOM, {
                    userId,
                    sessionId,
                    peerId,
                });
            }

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
        VideoEvent.USER_START_SCREEN_SHARING,
        async (userData: PrivateVideoRoomShareScreenData) => {
            const { sessionId, userId, peerId } = userData;
            const session = await VideoSession.findOne({
                sessionId,
            });
            if (!session) {
                return;
            }
            // Too many sharing users
            if (session.numScreensAllowed <= session.sharingUsers.size) {
                io.to(socket.id).emit(VideoEvent.OPERATION_DENIED, {
                    reason: `Maximum number of sharing screens allowed reached: ${session.numScreensAllowed}`,
                });
                return;
            }
            session.sharingUsers.set(userId, peerId);
            await session.save();
            socket.join(sessionId);
            socket
                .in(sessionId)
                .emit(VideoEvent.USER_START_SCREEN_SHARING, userData);
            socket.on("disconnect", async () => {
                session.sharingUsers.delete(userId);
                await session.save();
                socket
                    .in(sessionId)
                    .emit(VideoEvent.USER_STOP_STREAMING, userData);
            });
        }
    );

    socket.on(
        VideoEvent.USER_STOP_STREAMING,
        async (userData: PrivateVideoRoomStopSharingData) => {
            const { sessionId, userId } = userData;
            const session = await VideoSession.findOne({
                sessionId,
            });
            if (!session) {
                return;
            }
            if (!session.sharingUsers.has(userId)) {
                return;
            }
            session.sharingUsers.delete(userId);
            await session.save();
            socket.in(sessionId).emit(VideoEvent.USER_STOP_STREAMING, userData);
        }
    );

    socket.on(
        VideoEvent.FORCE_STOP_SCREEN_SHARING,
        async (userData: PrivateVideoRoomForceStopSharingData) => {
            const { senderId, targetId, sessionId } = userData;
            const videoSession = await VideoSession.findOne({
                sessionId,
            });
            const session = await ClassroomSession.findById(sessionId);
            const sender = await User.findById(senderId);
            if (!session || !videoSession || !sender) {
                return;
            }
            if (!videoSession.sharingUsers.has(targetId)) {
                return;
            }
            if (
                !(
                    sender.courses.includes(session.courseCode) &&
                    sender.userType > UserType.STUDENT
                )
            ) {
                io.to(socket.id).emit(VideoEvent.OPERATION_DENIED, {
                    reason:
                        "You don't have permission to close other people's streams.",
                });
                return;
            }
            videoSession.sharingUsers.delete(targetId);
            await videoSession.save();
            socket
                .in(sessionId)
                .emit(VideoEvent.FORCE_STOP_SCREEN_SHARING, userData);
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

const preAuthCheck = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (req.headers.authorization) {
            try {
                const id = jwt.verify(
                    req.headers.authorization,
                    process.env.JWT_SECRET || "monkey_default_jwt"
                ) as string;
                if ((await User.count({ _id: id })) > 0) {
                    next();
                    return;
                }
            } catch (e) {
                res.status(401).end();
            }
        }
        res.status(401).end();
    }
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

app.use("/public", express.static("public"));

// Login and Registration routes.
app.use("/user", userNoAuthRoute);

// File routes.
app.use("/filehandler", fileNoAuthRoute);

// Health check route.
app.use("/health", healthCheckRoute);

// Authorisation routes.
app.use("/auth", authRoute);

// Login and Registration routes.
app.use("/user", preAuthCheck, userRoute);

// Session routes.
app.use("/session", preAuthCheck, sessionRoute);

// Chat routes.
app.use("/chat", preAuthCheck, chatRoute);

// Course routes.
app.use("/courses", preAuthCheck, courseRoute);

// Video routes.
app.use("/videos", preAuthCheck, videoRoute);

// Job routes.
app.use("/job", preAuthCheck, jobRoute);

// File routes.
app.use("/filehandler", preAuthCheck, fileRoute);

// Response collection routes.
app.use("/response-handler", preAuthCheck, responseRoute);

// TODO API Routes
app.use(
    "/api",
    preAuthCheck,
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
database
    .connect()
    .then(() => {
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
            console.log("Server is listening on", process.env.PORT || 5000);
        });
    })
    .catch(() => {
        console.log(
            "Failed to connect to MongoDB, check your environment variables has been set correctly."
        );
    });
