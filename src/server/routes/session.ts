import express from "express";
import { ExecutingEvent } from "../../events";
import {
    ClassroomSessionData,
    GetCanvasRequestType,
    GetCanvasResponseType,
    RoomType,
    SaveCanvasRequestType,
    SessionData,
    SessionDeleteRequestType,
    SessionInfo,
    UserData,
    UserDataResponseType,
} from "../../types";
import {
    BreakoutSession,
    ClassroomSession,
    Job,
    Session,
    SessionCanvas,
    SessionUsers,
    User,
} from "../database";
import { File, FileResponse } from "../database/schema/File";
import { Response } from "../database/schema/Response";
import {
    FileForm,
    MultipleChoiceResponseForm,
    ShortAnswerResponseForm,
} from "../database/schema/ResponseForm";
import { VideoSession } from "../database/schema/VideoSession";
import { ScheduleHandler } from "../jobs";
import {
    asyncHandler,
    classFormDataHasError,
    createNewSession,
} from "../utils";
import { getAllClassroomSessions, getUserDataFromJWT } from "./utils";

export const router = express.Router();

/**
 * Creates a single private session.
 */
router.post(
    "/create",
    asyncHandler<
        { id: string; name: string } | { message?: string },
        {},
        { name: string; description: string; courseCode?: string }
    >(async (req, res, next) => {
        try {
            if (req.body.name && req.headers.authorization) {
                const user = await getUserDataFromJWT(
                    req.headers.authorization
                );
                if (user) {
                    const session = await createNewSession(
                        req.body.name,
                        req.body.description,
                        user.id,
                        req.body.courseCode
                    );
                    await SessionCanvas.create({
                        sessionId: session._id,
                        strokes: [],
                    });
                    await SessionUsers.create({
                        sessionId: session._id,
                        userReferenceMap: new Map(),
                    });
                    console.log("Session created:", session.name);
                    res.json({
                        id: session._id,
                        name: session.name,
                    });
                }
            } else {
                res.status(500).json({
                    message: "Room name should not be empty",
                });
            }
            res.status(200);
        } catch (e) {
            res.status(500);
            next(new Error("Unexpected error has occured."));
        } finally {
            res.end();
        }
    })
);

/**
 * Route to get all private sessions the user can access.
 */
router.post(
    "/privateSessions",
    asyncHandler<Array<SessionInfo & { createdByUsername?: string }>, {}, {}>(
        async (req, res, next) => {
            try {
                if (req.headers.authorization) {
                    const currentUser = await getUserDataFromJWT(
                        req.headers.authorization
                    );
                    const query: Array<SessionInfo> = await Promise.all(
                        (await Session.find()).map(async (session) => {
                            const user = await User.findById(session.createdBy);
                            return {
                                id: session._id,
                                name: session.name,
                                description: session.description,
                                courseCode: session.courseCode,
                                createdBy: session.createdBy,
                                createdByUsername: user?.username,
                            };
                        })
                    );
                    res.json(
                        query.filter((session) => {
                            if (!session.courseCode) {
                                return true;
                            }
                            return currentUser?.courses.includes(
                                session.courseCode
                            );
                        })
                    );
                }
            } catch (e) {
                console.log("error", e);
                res.status(500);
                next(new Error("Unexpected error has occured."));
            } finally {
                res.status(200).end();
            }
        }
    )
);

/**
 * Route to get all classroom sessions the user can access.
 */
router.post(
    "/classroomSessions",
    asyncHandler<
        Array<ClassroomSessionData & { createdByUsername?: string }>,
        {},
        {}
    >(async (req, res, next) => {
        try {
            if (req.headers.authorization) {
                const currentUser = await getUserDataFromJWT(
                    req.headers.authorization
                );
                if (currentUser) {
                    res.status(200).json(
                        await getAllClassroomSessions(currentUser)
                    );
                } else {
                    res.status(402);
                }
            }
        } catch (e) {
            console.log("error", e);
            res.status(500);
            next(new Error("Unexpected error has occured."));
        } finally {
            res.end();
        }
    })
);

/**
 * Route to get all upcoming sessions.
 */
router.post(
    "/upcomingClassroomSessions",
    asyncHandler<
        Array<
            Omit<ClassroomSessionData, "messages"> & {
                createdByUsername?: string;
            }
        >,
        {},
        { limit?: number }
    >(async (req, res, next) => {
        try {
            if (req.headers.authorization) {
                const currentUser = await getUserDataFromJWT(
                    req.headers.authorization
                );
                if (currentUser) {
                    res.status(200).json(
                        await getAllClassroomSessions(
                            currentUser,
                            "upcoming",
                            req.body.limit
                        )
                    );
                } else {
                    res.status(402);
                }
            }
        } catch (e) {
            console.log("error", e);
            res.status(500);
            next(new Error("Unexpected error has occured."));
        } finally {
            res.end();
        }
    })
);

/**
 * Route to get data associated with a single session.
 */
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

/**
 * Route to get data associated with a single breakout room session.
 */
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

/**
 * Route to get data associated with a single classroom session.
 */
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
                        roomType: session.roomType,
                        description: session.description,
                        courseCode: session.courseCode,
                        messages: session.messages,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        colourCode: session.colourCode,
                        open: session.open,
                        createdBy: session.createdBy,
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

/**
 * Route to edit a classroom session.
 */
router.post(
    "/edit/classroomSession",
    asyncHandler<
        { message?: string },
        {},
        { data: Omit<ClassroomSessionData, "messages">; type: RoomType }
    >(async (req, res, next) => {
        try {
            const data = req.body.data;
            const errorMessage = classFormDataHasError(data);
            if (errorMessage) {
                res.status(500)
                    .json({
                        message: errorMessage,
                    })
                    .end();
                return;
            }
            console.log(req.body);
            if (new Date(data.endTime).getTime() < new Date().getTime()) {
                await ClassroomSession.findByIdAndUpdate(req.body.data.id, {
                    ...req.body.data,
                });
            } else {
                const session = await ClassroomSession.findByIdAndUpdate(
                    req.body.data.id,
                    {
                        ...req.body.data,
                        open: false,
                    }
                );
                if (session) {
                    const schedulerHandler: ScheduleHandler<{
                        id: string;
                    }> = ScheduleHandler.getInstance();
                    await schedulerHandler.removeQueuedJob(session._id);
                    await schedulerHandler.addNewJob({
                        jobId: session._id,
                        jobDate: req.body.data.startTime,
                        executingEvent: ExecutingEvent.CLASS_OPEN,
                        data: {
                            id: session._id,
                        },
                    });
                }
            }
            res.status(200);
        } catch (e) {
            console.log("error", e);
            res.status(500);
            next(new Error("Unexpected error has occured."));
        } finally {
            res.end();
        }
    })
);

/**
 * Route to edit a private room session.
 */
router.post(
    "/edit/privateSession",
    asyncHandler<
        { message?: string },
        {},
        { id: string; name: string; description: string; courseCode?: string }
    >(async (req, res, next) => {
        try {
            await Session.findByIdAndUpdate(req.body.id, {
                name: req.body.name,
                description: req.body.description,
                courseCode: req.body.courseCode,
            });
            res.status(200);
        } catch (e) {
            console.log("error", e);
            res.status(500);
            next(new Error("Unexpected error has occured."));
        } finally {
            res.end();
        }
    })
);

/**
 * Route to delete a private session.
 */
router.post(
    "/delete/privateRoom",
    asyncHandler<undefined, {}, SessionDeleteRequestType>(
        async (req, res, next) => {
            console.log("Deleting private room:", req.body.id);

            // These are for deleting forms and answers for privaterooms.
            // Remove or uncomment when we decide if we want responses in private rooms.

            // await MultipleChoiceResponseForm.deleteMany({
            //     sessionID: req.body.id,
            // });
            // const shortAnswerResponseIDs = await ShortAnswerResponseForm.find({
            //     sessionID: req.body.id,
            // });
            // for (let form of shortAnswerResponseIDs) {
            //     await Response.deleteMany({ formID: form.id });
            // }

            try {
                await File.deleteMany({ sessionID: req.body.id });
                await Session.findByIdAndDelete(req.body.id);
                await SessionCanvas.findOneAndDelete({
                    sessionId: req.body.id,
                });
            } catch (e) {
                res.status(500);
            } finally {
                next();
            }
        }
    )
);

/**
 * Route to delete a classroom session.
 */
router.post(
    "/delete/classroom",
    asyncHandler<undefined, {}, SessionDeleteRequestType>(
        async (req, res, next) => {
            console.log(req.body);
            console.log("Deleting classroom:", req.body.id);
            try {
                await File.deleteMany({ sessionID: req.body.id });
                await FileForm.deleteMany({ sessionID: req.body.id });
                await FileResponse.deleteMany({ sessionID: req.body.id });

                await MultipleChoiceResponseForm.deleteMany({
                    sessionID: req.body.id,
                });
                const shortAnswerResponseIDs = await ShortAnswerResponseForm.find(
                    {
                        sessionID: req.body.id,
                    }
                );
                for (let form of shortAnswerResponseIDs) {
                    await Response.deleteMany({ formID: form.id });
                }
                await ClassroomSession.findByIdAndDelete(req.body.id);
                await VideoSession.findOneAndDelete({ sessionId: req.body.id });
                await BreakoutSession.deleteMany({
                    parentSessionId: req.body.id,
                });
                await Job.findByIdAndDelete(req.body.id);
            } catch (e) {
                res.status(500);
            } finally {
                next();
            }
            res.status(200).end();
        }
    )
);

/**
 * Route for deleting any sessions, used to remove shared information between session types.
 */
router.post(
    "/delete/*",
    asyncHandler<undefined, {}, SessionDeleteRequestType>(
        async (req, res, next) => {
            console.log("Deleting room:", req.body.id);
            try {
                await MultipleChoiceResponseForm.deleteMany({
                    sessionID: req.body.id,
                });
                const shortAnswerResponseIDs = await ShortAnswerResponseForm.find(
                    {
                        sessionID: req.body.id,
                    }
                );
                for (let form of shortAnswerResponseIDs) {
                    await Response.deleteMany({ formID: form.id });
                }
                await ShortAnswerResponseForm.deleteMany({
                    sessionID: req.body.id,
                });
                await SessionUsers.deleteOne({ sessionId: req.body.id });
            } catch (e) {
                res.status(500);
            } finally {
                res.end();
            }
        }
    )
);

/**
 * Saves the state of the canvas in a private room.
 */
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

/**
 * Gets the state of the canvas in a private room.
 */
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

/**
 * Clears all strokes on a canvas.
 */
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

/**
 * Gets the users in a session.
 */
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

/**
 * Creates a set of breakout rooms associated with a classroom.
 */
router.post(
    "/createBreakoutRooms",
    asyncHandler<
        { rooms: Array<string> },
        {},
        {
            rooms: Array<string>;
            sessionId: string;
        }
    >(async (req, res) => {
        const session = await ClassroomSession.findById(req.body.sessionId);
        if (session) {
            const breakoutRooms: Array<string> = (
                await Promise.all(
                    req.body.rooms.map(async (roomId, i) => {
                        const breakoutSession = await BreakoutSession.findOneAndUpdate(
                            {
                                id: roomId,
                            },
                            {
                                id: roomId,
                                name: `${session.name} - Breakout Room ${
                                    i + 1
                                }`,
                                messages: [],
                                description: session.description,
                                roomType: RoomType.PRIVATE,
                                courseCode: session?.courseCode,
                                parentSessionId: session?._id,
                            },
                            {
                                upsert: true,
                                new: true,
                                setDefaultsOnInsert: true,
                            }
                        );
                        await SessionUsers.findOneAndUpdate(
                            {
                                sessionId: breakoutSession._id,
                            },
                            {
                                sessionId: breakoutSession._id,
                                userReferenceMap: new Map(),
                            },
                            {
                                upsert: true,
                                new: true,
                            }
                        );
                        await SessionCanvas.findOneAndUpdate(
                            {
                                sessionId: breakoutSession._id,
                            },
                            {
                                sessionId: breakoutSession._id,
                                strokes: [],
                            },
                            {
                                upsert: true,
                                new: true,
                            }
                        );
                        return breakoutSession;
                    })
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

/**
 * Gets all breakout rooms associated with a classroom.
 */
router.post(
    "/getBreakoutRooms",
    asyncHandler<
        { rooms: Array<{ roomId: string; users: Array<UserData> }> },
        {},
        { sessionId: string }
    >(async (req, res) => {
        const breakoutRooms = await BreakoutSession.find({
            parentSessionId: req.body.sessionId,
        }).lean();

        const rooms = await Promise.all(
            breakoutRooms.map(async (room) => {
                const sessionUsers = await SessionUsers.findOne({
                    sessionId: room._id,
                });
                const users = await Promise.all(
                    Array.from(sessionUsers?.userReferenceMap.keys() || []).map(
                        async (key) => {
                            const user = await User.findById(key);
                            return {
                                id: user!.id,
                                username: user!.username,
                                userType: user!.userType,
                            };
                        }
                    )
                );
                return {
                    roomId: room._id,
                    users,
                };
            })
        );
        res.json({
            rooms,
        });
    })
);

/**
 * Deletes a single breakout room.
 */
router.post(
    "/deleteBreakoutRoom",
    asyncHandler<undefined, {}, { sessionId: string }>(async (req, res) => {
        try {
            await BreakoutSession.findByIdAndDelete(req.body.sessionId);
            res.status(200);
        } catch (e) {
            res.status(500);
        } finally {
            res.end();
        }
    })
);

/**
 * Deletes all breakout rooms associated with a classroom.
 */
router.post(
    "/deleteAllBreakoutRooms",
    asyncHandler<undefined, {}, { sessionId: string }>(async (req, res) => {
        try {
            await BreakoutSession.deleteMany({
                parentSessionId: req.body.sessionId,
            });
            res.status(200);
        } catch (e) {
            res.status(500);
        } finally {
            res.end();
        }
    })
);

/**
 * Adds a single user to the list of users who have their hands raised.
 */
router.post(
    "/addRaisedHandUser",
    asyncHandler<undefined, {}, { sessionId: string; userId: string }>(
        async (req, res) => {
            try {
                await ClassroomSession.findByIdAndUpdate(req.body.sessionId, {
                    $push: {
                        raisedHandUsers: req.body.userId,
                    },
                }).lean();
                res.status(200);
            } catch (e) {
                res.status(500);
            } finally {
                res.end();
            }
        }
    )
);

/**
 * Removes a single user to the list of users who have their hands raised.
 */
router.post(
    "/removeRaisedHandUser",
    asyncHandler<undefined, {}, { sessionId: string; userId: string }>(
        async (req, res) => {
            try {
                await ClassroomSession.findByIdAndUpdate(req.body.sessionId, {
                    $pull: {
                        raisedHandUsers: req.body.userId,
                    },
                }).lean();
                res.status(200);
            } catch (e) {
                res.status(500);
            } finally {
                res.end();
            }
        }
    )
);

/**
 * Gets the list of users who have their hands raised.
 */
router.post(
    "/getRaisedHandUsers",
    asyncHandler<{ raisedHandUsers: Array<string> }, {}, { sessionId: string }>(
        async (req, res) => {
            try {
                const session = await ClassroomSession.findOne({
                    sessionId: req.body.sessionId,
                }).lean();
                res.json({
                    raisedHandUsers: session?.raisedHandUsers || [],
                });
            } catch (e) {
                res.status(500);
            } finally {
                res.end();
            }
        }
    )
);
