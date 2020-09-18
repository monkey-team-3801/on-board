import express from "express";

import { asyncHandler, createNewSession } from "../utils";
import { Session } from "../database";
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
} from "../../types";
import { ClassroomSession } from "../database/schema";

export const router = express.Router();

router.post(
    "/create",
    asyncHandler<undefined, {}, { name: string }>(async (req, res, next) => {
        try {
            if (req.body.name && req.body.name !== "") {
                const session = await createNewSession(req.body.name, "");
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
        } else if (req.body.roomType === RoomType.CLASS) {
            await ClassroomSession.findByIdAndDelete(req.body.id);
        }
        res.status(200).end();
    })
);

router.post(
    "/saveCanvas",
    asyncHandler<undefined, {}, SaveCanvasRequestType>(async (req, res) => {
        try {
            await Session.updateOne(
                { _id: req.body.sessionId },
                {
                    canvasData: req.body.canvasData,
                },
                { upsert: true }
            );
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
            const session = await Session.findById(req.body.sessionId);
            if (session) {
                res.json({
                    canvasData: session.canvasData,
                });
            }
            res.end();
        }
    )
);

// TODO
// router.post(
//     "/edit",
//     asyncHandler((req, res) => {
//         res.status(200).end();
//     })
// );
