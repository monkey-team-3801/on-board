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
} from "../../types";
import { ClassroomSession } from "../database/schema";

export const router = express.Router();

router.post(
    "/create",
    asyncHandler<undefined, {}, { name: string }>(async (req, res) => {
        try {
            if (req.body.name && req.body.name !== "") {
                const session = await createNewSession(req.body.name, "");
                console.log("Session created:", session.name);
            }
            res.status(200).end();
        } catch (e) {
            console.log("error", e);
            res.status(500).end();
        }
    })
);

router.post(
    "/sessions",
    asyncHandler<SessionResponseType, {}, SessionRequestType>(
        async (req, res) => {
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
                res.status(500).end();
            }
        }
    )
);

router.post(
    "/getPrivateSession",
    asyncHandler<SessionData, {}, { id: string }>(async (req, res) => {
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
            res.status(500).end();
        }
    })
);

router.post(
    "/getClassroomSession",
    asyncHandler<ClassroomSessionData, {}, { id: string }>(async (req, res) => {
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
            res.status(500).end();
        }
        res.end();
    })
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

// TODO
// router.post(
//     "/edit",
//     asyncHandler((req, res) => {
//         res.status(200).end();
//     })
// );
