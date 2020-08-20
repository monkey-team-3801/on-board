import express from "express";

import { asyncHandler } from "../utils";
import { Session } from "../database";
import { SessionResponseType, SessionInfo, SessionData } from "../../types";

export const router = express.Router();

router.post(
    "/create",
    asyncHandler<undefined, {}, { name: string }>(async (req, res) => {
        try {
            if (req.body.name && req.body.name !== "") {
                const session = await Session.create({
                    name: req.body.name,
                });
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
    asyncHandler<SessionResponseType>(async (req, res) => {
        try {
            const query = await Session.find();
            const sessions: Array<SessionInfo> = query.map((session) => {
                return {
                    id: session._id,
                    name: session.name,
                };
            });
            res.json({
                sessions,
            });
        } catch (e) {
            console.log("error", e);
            res.status(500).end();
        }
    })
);

router.post(
    "/getSession",
    asyncHandler<SessionData, {}, { id: string }>(async (req, res) => {
        try {
            const session = await Session.findById(req.body.id);
            res.json({
                id: session?._id,
                name: session?.name || "",
                messages: session?.messages || [],
            });
        } catch (e) {
            console.log("error", e);
            res.status(500).end();
        }
    })
);

router.post(
    "/delete",
    asyncHandler<undefined, {}, { id: string }>(async (req, res) => {
        console.log("Deleting session:", req.body.id);
        await Session.findByIdAndDelete(req.body.id);
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
