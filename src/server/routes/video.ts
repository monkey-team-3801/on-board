import express from "express";
import { asyncHandler } from "../utils";
import { VideoSession } from "../database/schema/VideoSession";
import { VideoSessionResponseType, VideoPeersResponseType } from "../../types";
import { v4 as uuid } from "uuid";
export const router = express.Router();

router.post(
    "/create",
    asyncHandler<VideoSessionResponseType, {}>(async (req, res) => {
        try {
            const session = await VideoSession.create({
                sessionId: uuid(),
                userPeerMap: new Map(),
                userReferenceMap: new Map(),
                numScreensAllowed: 1,
                sharingUsers: [],
            });
            console.log("Video Session created:", session.sessionId);

            res.status(200).json({
                sessionId: session.sessionId,
            });
        } catch (e) {
            console.log("error", e);
            res.status(500).end();
        }
    })
);

router.post(
    "/userJoin",
    asyncHandler<{}, {}, { sessionId: string; peerId: string }>(
        async (req, res) => {
            res.end();
            // try {
            //     const session = await VideoSession.findOne({
            //         sessionId: req.body.sessionId,
            //     });
            //     if (!session) {
            //         res.status(404).end();
            //         return;
            //     }
            //     session.peers.push(req.body.peerId);
            //     await session.save();
            //     res.status(200).end();
            // } catch (e) {
            //     console.log("error", e);
            //     res.status(500).end();
            // }
        }
    )
);

router.post(
    "/",
    asyncHandler<Array<VideoSessionResponseType>, {}, {}>(
        async (req, res, next) => {
            try {
                const sessions = await VideoSession.find({});
                res.status(200).json(
                    sessions.map((session) => ({
                        sessionId: session.sessionId,
                    }))
                );
            } catch (e) {
                console.log("error", e);
                res.status(500).end();
            }
        }
    )
);

router.post(
    "/peers",
    asyncHandler<
        VideoPeersResponseType,
        {},
        { sessionId: string; userId: string }
    >(async (req, res, next) => {
        try {
            const session = await VideoSession.findOne({
                sessionId: req.body.sessionId,
            });

            const peers = Array.from(session?.userPeerMap.entries() || [])
                .filter((value: [string, string]) => {
                    const [userId] = value;
                    return userId !== req.body.userId;
                })
                .map((value: [string, string]) => {
                    const [userId, peerId] = value;
                    return {
                        userId,
                        peerId,
                    };
                });
            res.status(200).json({
                peers,
            });
        } catch (e) {
            console.log("error", e);
            res.status(500).end();
        }
    })
);
