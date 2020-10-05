import express from "express";

import { asyncHandler } from "../utils";
import { NewMessageRequestType, RoomType } from "../../types";
import { Session, ClassroomSession, BreakoutSession } from "../database";

export const router = express.Router();

const roomTypeToSession = async (id: string, roomType: RoomType) => {
    switch (roomType) {
        case RoomType.PRIVATE:
            return await Session.findById(id);
        case RoomType.CLASS:
            return await ClassroomSession.findById(id);
        case RoomType.BREAKOUT:
            return await BreakoutSession.findById(id);
    }
};

router.post(
    "/newMessage",
    asyncHandler<undefined, {}, NewMessageRequestType>(
        async (req, res, next) => {
            try {
                const session = await roomTypeToSession(
                    req.body.sessionId,
                    req.body.roomType
                );
                console.log(session, req.body.sessionId, req.body.roomType);
                session?.messages?.push({
                    sendUser: req.body.sendUser,
                    content: req.body.content,
                    sentTime: new Date().toISOString(),
                });
                await session?.save();

                res.status(200);
            } catch (e) {
                console.log("error", e);
                res.status(500);
            } finally {
                res.end();
            }
        }
    )
);
