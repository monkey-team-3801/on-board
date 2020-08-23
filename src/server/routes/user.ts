import express from "express";
import { User } from "../database/schema";
import { asyncHandler } from "../utils";
import {
    CreateUserRequestType,
    UserType,
    LoginUserResponseType,
} from "../../types";

export const router = express.Router();

router.get("/", (req, res) => {
    //TODO
});

// Route to handle login requests.
router.post(
    "/login",
    asyncHandler<
        LoginUserResponseType,
        {},
        { username: string; password: string; id: string }
    >(async (req, res) => {
        const usernameQuery = await User.findOne({
            username: req.body.username,
        });
        if (usernameQuery !== null) {
            if (req.body.password === usernameQuery.password) {
                res.json({
                    id: usernameQuery._id,
                });
            }
            res.status(500).end();
        }
        res.status(500).end();
    })
);

// Route to handle registration requests.
router.post(
    "/register",
    asyncHandler<
        CreateUserRequestType,
        {},
        { username: string; password: string; userType: UserType }
    >(async (req, res) => {
        await User.create({
            username: req.body.username,
            password: req.body.password,
            userType: req.body.userType,
        });
        res.status(200).end();
    })
);
