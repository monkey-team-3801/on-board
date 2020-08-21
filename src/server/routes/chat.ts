import express from "express";

import { asyncHandler } from "../utils";
import { io } from "../server";
import { ChatEvent } from "../../events";
import { MessageData } from "../../types";
import { Session } from "../database";

export const router = express.Router();

router.post(
    "/newMessage",
    asyncHandler<undefined, {}, MessageData>(async (req, res, next) => {
        io.emit(ChatEvent.ON_NEW_MESASGE, req.body);
        const session = await Session.findById(req.body.sessionId);
        session?.messages?.push({
            sendUser: req.body.sendUser,
            content: req.body.content,
            sentTime: req.body.sentTime,
        });
        await session?.save();
        res.end();
    })
);
