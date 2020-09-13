import express from "express";

import { User } from "../database/schema";
import { asyncHandler } from "../utils";
import {
    CreateUserRequestType,
    LoginSuccessResponseType,
    LoginUserRequestType,
    UserDataResponseType,
    EnrolCourseRequestType,
    UserEnrolledCoursesResponseType,
} from "../../types";
import { hashPassword, generateJWT, getUserDataFromJWT } from "./utils";
import { MongoError } from "mongodb";

export const router = express.Router();

// Route to handle login requests.
router.post(
    "/login",
    asyncHandler<LoginSuccessResponseType, {}, LoginUserRequestType>(
        async (req, res, next) => {
            const userQuery = await User.findOne({
                username: req.body.username,
            });
            if (userQuery) {
                if (hashPassword(req.body.password) === userQuery.password) {
                    res.json({
                        id: userQuery._id.toHexString(),
                        jwtToken: generateJWT(userQuery._id.toHexString()),
                    }).end();
                    return;
                }
            }
            res.status(401);
            next(new Error("Incorrect username or password."));
        }
    )
);

// Route to handle registration requests.
router.post(
    "/register",
    asyncHandler<LoginSuccessResponseType, {}, CreateUserRequestType>(
        async (req, res, next) => {
            try {
                const user = await User.create({
                    username: req.body.username,
                    password: hashPassword(req.body.password),
                    userType: req.body.userType,
                    courses: [],
                    pfp: [],
                });
                res.status(200).json({
                    id: user._id.toHexString(),
                    jwtToken: generateJWT(user._id.toHexString()),
                });
            } catch (e) {
                const err: MongoError = e;
                if (err.code === 11000) {
                    res.status(422);
                    next(
                        new Error(
                            `Username ${req.body.username} is not available.`
                        )
                    );
                } else {
                    res.status(500);
                    next(new Error("Unexpected error has occured."));
                }
            }
        }
    )
);

router.post(
    "/data",
    asyncHandler<UserDataResponseType | undefined>(async (req, res) => {
        if (req.headers.authorization) {
            const user = await getUserDataFromJWT(req.headers.authorization);
            if (user) {
                res.json({
                    id: user._id.toHexString(),
                    username: user.username,
                    userType: user.userType,
                    courses: user.courses,
                });
            }
        }
        res.end();
    })
);

router.post(
    "/enrol",
    asyncHandler<{}, {}, EnrolCourseRequestType>(async (req, res, next) => {
        try {
            const user = await User.findById(req.body.userId);
            if (user) {
                user.courses = req.body.courses;
                user.save();
            }
            res.status(200).end();
        } catch (e) {
            res.status(500);
            next(new Error("Unexpected error has occured."));
        }
    })
);

router.post(
    "/courses",
    asyncHandler<UserEnrolledCoursesResponseType>(async (req, res) => {
        if (req.headers.authorization) {
            const user = await getUserDataFromJWT(req.headers.authorization);
            if (user) {
                res.json({
                    courses: user.courses,
                });
            }
        }
        res.end();
    })
);
