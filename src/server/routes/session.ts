import express from "express";

import { asyncHandler, createNewSession } from "../utils";
import {
    Session,
    ClassroomSession,
    SessionCanvas,
    SessionUsers,
    BreakoutSession,
    User,
} from "../database";
import {
    SessionResponseType,
    SessionInfo,
    SessionData,
    SessionRequestType,
    ClassroomSessionData,
    SessionDeleteRequestType,
    RoomType,
    SaveCanvasRequestType,
    GetCanvasRequestType,
    GetCanvasResponseType,
    BreakoutRoomData,
    UserDataResponseType,
} from "../../types";
import { VideoSession } from "../database/schema/VideoSession";
import { io } from "../server";

export const router = express.Router();

router.post(
    "/create",
    asyncHandler<undefined, {}, { name: string }>(async (req, res, next) => {
        try {
            if (req.body.name && req.body.name !== "") {
                const session = await createNewSession(req.body.name, "");
                await SessionCanvas.create({
                    sessionId: session._id,
                    strokes: [],
                });
                await SessionUsers.create({
                    sessionId: session._id,
                    userReferenceMap: new Map(),
                });
                console.log("Session created:", session.name);
            }
            res.status(200).end();
        } catch (e) {
            res.status(500);
            next(new Error("Unexpected error has occured."));
        }
    })
);

router.post(
    "/sessions",
    asyncHandler<SessionResponseType, {}, SessionRequestType>(
        async (req, res, next) => {
            try {
                const sessions: Array<SessionInfo> = (await Session.find())
                    .filter((session) => session.roomType === req.body.roomType)
                    .map((session) => {
                        return {
                            id: session._id,
                            name: session.name,
                            description: session.description,
                            courseCode: session.courseCode,
                        };
                    });
                const classroomSessions: Array<SessionInfo> = (
                    await ClassroomSession.find()
                )
                    .filter((session) => session.roomType === req.body.roomType)
                    .map((session) => {
                        return {
                            id: session._id,
                            name: session.name,
                            description: session.description,
                            courseCode: session.courseCode,
                        };
                    });
                res.json({
                    sessions: [...sessions, ...classroomSessions],
                });
            } catch (e) {
                console.log("error", e);
                res.status(500);
                next(new Error("Unexpected error has occured."));
            }
        }
    )
);

router.post(
    "/getPrivateSession",
    asyncHandler<SessionData, {}, { id: string }>(async (req, res, next) => {
        try {
            const session = await Session.findById(req.body.id);
            if (session) {
                res.json({
                    id: session._id,
                    name: session.name,
                    description: session.description,
                    courseCode: session.courseCode,
                    messages: session.messages,
                });
            }
        } catch (e) {
            console.log("error", e);
            res.status(500);
            next(new Error("Unexpected error has occured."));
        }
    })
);

router.post(
    "/getBreakoutSession",
    asyncHandler<SessionData, {}, { id: string }>(async (req, res, next) => {
        try {
            const session = await BreakoutSession.findById(req.body.id);
            if (session) {
                res.json({
                    id: session._id,
                    name: session.name,
                    description: session.description,
                    courseCode: session.courseCode,
                    messages: session.messages,
                    parentSessionId: session.parentSessionId,
                });
            }
        } catch (e) {
            console.log("error", e);
            res.status(500);
            next(new Error("Unexpected error has occured."));
        }
    })
);

router.post(
    "/getClassroomSession",
    asyncHandler<ClassroomSessionData, {}, { id: string }>(
        async (req, res, next) => {
            try {
                const session = await ClassroomSession.findById(req.body.id);
                if (session) {
                    res.json({
                        id: session._id,
                        name: session.name,
                        description: session.description,
                        courseCode: session.courseCode,
                        messages: session.messages,
                        startTime: session.startTime,
                        endTime: session.endTime,
                    });
                }
            } catch (e) {
                console.log("error", e);
                res.status(500);
                next(new Error("Unexpected error has occured."));
            }
            res.end();
        }
    )
);

router.post(
    "/delete",
    asyncHandler<undefined, {}, SessionDeleteRequestType>(async (req, res) => {
        console.log("Deleting session:", req.body.id);
        if (req.body.roomType === RoomType.PRIVATE) {
            await Session.findByIdAndDelete(req.body.id);
            await SessionCanvas.findOneAndDelete({ sessionId: req.body.id });
        } else if (req.body.roomType === RoomType.CLASS) {
            await ClassroomSession.findByIdAndDelete(req.body.id);
            await VideoSession.findOneAndDelete({ sessionId: req.body.id });
        }
        res.status(200).end();
    })
);

router.post(
    "/saveCanvas",
    asyncHandler<undefined, {}, SaveCanvasRequestType>(async (req, res) => {
        try {
            await SessionCanvas.findOneAndUpdate(
                {
                    sessionId: req.body.sessionId,
                },
                {
                    $push: {
                        strokes: {
                            $each: req.body.strokes,
                        },
                    },
                }
            ).lean();
            res.end();
        } catch (e) {
            console.log("err", e);
        }
    })
);

router.post(
    "/getCanvas",
    asyncHandler<GetCanvasResponseType, {}, GetCanvasRequestType>(
        async (req, res) => {
            const canvas = await SessionCanvas.findOne({
                sessionId: req.body.sessionId,
            }).lean();
            if (canvas) {
                res.json({
                    strokes: canvas.strokes,
                });
            }
            res.end();
        }
    )
);

router.post(
    "/clearCanvas",
    asyncHandler<undefined, {}, GetCanvasRequestType>(async (req, res) => {
        await SessionCanvas.findOneAndUpdate(
            {
                sessionId: req.body.sessionId,
            },
            {
                strokes: [],
            }
        ).lean();
        res.end();
    })
);

router.post(
    "/getSessionUsers",
    asyncHandler<
        { users: Array<Omit<UserDataResponseType, "courses">> },
        {},
        { sessionId: string }
    >(async (req, res) => {
        const sessionUsers = await SessionUsers.findOne({
            sessionId: req.body.sessionId,
        });
        const ids = Array.from(sessionUsers?.userReferenceMap.keys() || []);
        const users = (
            await User.find({
                _id: {
                    $in: ids,
                },
            })
        ).map((user) => {
            return {
                id: user._id.toHexString(),
                username: user.username,
                userType: user.userType,
            };
        });
        res.json({
            users,
        });
    })
);

router.post(
    "/createBreakoutRooms",
    asyncHandler<
        { rooms: Array<string> },
        {},
        {
            amount: number;
            sessionId: string;
        }
    >(async (req, res) => {
        const session = await ClassroomSession.findById(req.body.sessionId);
        if (session) {
            const breakoutRooms: Array<string> = (
                await Promise.all(
                    Array.from({ length: req.body.amount }).map(
                        async (_, i) => {
                            const breakoutSession = await BreakoutSession.create(
                                {
                                    name: `${session.name} - Breakout Room ${
                                        i + 1
                                    }`,
                                    messages: [],
                                    description: session.description,
                                    roomType: RoomType.PRIVATE,
                                    courseCode: session?.courseCode,
                                    parentSessionId: session?._id,
                                }
                            );
                            await SessionUsers.create({
                                sessionId: breakoutSession._id,
                                userReferenceMap: new Map(),
                            });
                            return breakoutSession;
                        }
                    )
                )
            ).map((room) => {
                return room._id;
            });

            res.json({
                rooms: breakoutRooms,
            });
        } else {
            res.json({
                rooms: [],
            });
        }
        res.end();
    })
);
