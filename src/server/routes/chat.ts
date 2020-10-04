import express from "express";

import { asyncHandler } from "../utils";
import { NewMessageRequestType, RoomType } from "../../types";
import { Session, ClassroomSession } from "../database";

export const router = express.Router();

const roomTypeToSession = async (id: string, roomType: RoomType) => {
    return roomType === RoomType.PRIVATE
        ? Session.findById(id)
        : ClassroomSession.findById(id);
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
                session?.messages?.push({
                    sendUser: req.body.sendUser,
                    content: req.body.content,
                    sentTime: new Date().toISOString(),
                });
                await session?.save();

                res.status(200);
            } catch (e) {
                res.status(500);
            } finally {
                res.end();
            }
        }
    )
);
