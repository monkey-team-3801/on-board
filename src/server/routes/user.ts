import express from "express";
import { User } from "../database/schema";
import { asyncHandler } from "../utils";
import {
    LoginUserRequestType,
    CreateUserRequestType,
    UserType,
} from "../../types";

export const router = express.Router();

router.get("/", (req, res) => {
    //TODO
});

router.post(
    "/login",
    asyncHandler<
        LoginUserRequestType,
        {},
        { username: string; password: string }
    >(async (req, res) => {
        //TODO
        // const query = await User.find().select({ username: req.body.username });
        // console.log(query[0].username);
    })
);

router.post(
    "/register",
    asyncHandler<
        CreateUserRequestType,
        {},
        { username: string; password: string; userType: UserType }
    >(async (req, res) => {
        //TODO
    })
);
