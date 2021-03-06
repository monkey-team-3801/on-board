import express from "express";
import { asyncHandler } from "../utils";
import { VideoSession } from "../database/schema/VideoSession";
import {
    VideoSessionResponseType,
    VideoPeersResponseType,
    VideoScreenSharingUsersType,
} from "../../types";
import { v4 as uuid } from "uuid";
export const router = express.Router();

/**
 * Creates a single video session for streaming.
 */
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

            res.status(200).json({
                sessionId: session.sessionId,
            });
        } catch (e) {
            res.status(500).end();
        }
    })
);

/**
 * Route to handle user joining a video session.
 */
router.post(
    "/userJoin",
    asyncHandler<{}, {}, { sessionId: string; peerId: string }>(
        async (req, res) => {
            res.end();
        }
    )
);

/**
 * Route to get all users who are sharing a stream.
 */
router.post(
    "/:sessionId/sharing",
    asyncHandler<VideoScreenSharingUsersType, { sessionId: string }, {}>(
        async (req, res) => {
            try {
                const session = await VideoSession.findOne({
                    sessionId: req.params.sessionId,
                });
                if (!session) {
                    res.status(404).end();
                    return;
                }
                res.json(session.sharingUsers);
            } catch (e) {
                res.status(500).end();
            }
        }
    )
);

/**
 * Route to get all video sessions.
 */
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
                res.status(500).end();
            }
        }
    )
);

/**
 * Route to get all peers associated with a session and a user.
 */
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
            res.status(500).end();
        }
    })
);
