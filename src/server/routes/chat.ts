import express from "express";

import { asyncHandler } from "../utils";
import { NewMessageRequestType, RoomType, MessageData } from "../../types";
import {
    Session,
    ClassroomSession,
    BreakoutSession,
    UserToUserChat,
} from "../database";

export const router = express.Router();

const roomTypeToSession = async (id: string, roomType: RoomType) => {
    switch (roomType) {
        case RoomType.PRIVATE:
            return Session.findById(id);
        case RoomType.CLASS:
            return ClassroomSession.findById(id);
        case RoomType.BREAKOUT:
            return BreakoutSession.findById(id);
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

router.post(
    "/privateChat",
    asyncHandler<
        { chatId: string; messages: Array<Omit<MessageData, "sessionId">> },
        {},
        {
            myUserId: string;
            theirUserId: string;
        }
    >(async (req, res, next) => {
        try {
            const chatData = await UserToUserChat.findOneAndUpdate(
                {
                    betweenUsers: {
                        $all: [
                            {
                                $elemMatch: {
                                    $eq: req.body.myUserId,
                                },
                            },
                            {
                                $elemMatch: {
                                    $eq: req.body.theirUserId,
                                },
                            },
                        ],
                    },
                },
                {
                    betweenUsers: [req.body.myUserId, req.body.theirUserId],
                    usersToHasNewMessageMap: new Map([
                        [req.body.myUserId, false],
                        [req.body.theirUserId, false],
                    ]),
                    messages: [],
                },
                {
                    upsert: true,
                    new: true,
                }
            );
            if (chatData) {
                res.status(200).json({
                    chatId: chatData._id,
                    messages: chatData.messages,
                });
            } else {
                res.status(404);
            }
        } catch (e) {
            console.log(e);
            res.status(500);
        } finally {
            res.end();
        }
    })
);

router.post(
    "/privateChat/newMessage",
    asyncHandler<
        undefined,
        {},
        {
            message: Omit<MessageData, "sessionId">;
            chatId: string;
            theirUserId: string;
        }
    >(async (req, res, next) => {
        try {
            const chatData = await UserToUserChat.findByIdAndUpdate(
                req.body.chatId,
                {
                    $push: {
                        messages: req.body.message,
                    },
                }
            );
            if (chatData) {
                chatData.usersToHasNewMessageMap.set(
                    req.body.theirUserId,
                    true
                );
                await chatData.save();
            }
        } catch (e) {
            res.status(500);
        } finally {
            res.end();
        }
    })
);
