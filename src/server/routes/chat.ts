import express from "express";

import { asyncHandler } from "../utils";
import { NewMessageRequestType } from "../../types";
import { Session } from "../database";

export const router = express.Router();

router.post(
    "/newMessage",
    asyncHandler<undefined, {}, NewMessageRequestType>(
        async (req, res, next) => {
            const session = await Session.findById(req.body.sessionId);
            session?.messages?.push({
                sendUser: req.body.sendUser,
                content: req.body.content,
                sentTime: new Date().toISOString(),
            });
            await session?.save();
            res.end();
        }
    )
);
