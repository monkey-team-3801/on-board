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

export const router = express.Router();

// Route to handle login requests.
router.post(
    "/login",
    asyncHandler<LoginSuccessResponseType, {}, LoginUserRequestType>(
        async (req, res) => {
            const userQuery = await User.findOne({
                username: req.body.username,
            });
            if (userQuery) {
                if (hashPassword(req.body.password) === userQuery.password) {
                    res.json({
                        id: userQuery._id.toHexString(),
                        jwtToken: generateJWT(userQuery._id.toHexString()),
                    });
                }
                res.status(500).end();
            }
            res.status(500).end();
        }
    )
);

// Route to handle registration requests.
router.post(
    "/register",
    asyncHandler<LoginSuccessResponseType, {}, CreateUserRequestType>(
        async (req, res) => {
            try {
                const user = await User.create({
                    username: req.body.username,
                    password: hashPassword(req.body.password),
                    userType: req.body.userType,
                    courses: [],
                });
                res.status(200).json({
                    id: user._id.toHexString(),
                    jwtToken: generateJWT(user._id.toHexString()),
                });
            } catch (e) {
                res.status(500).end();
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
                });
            }
        }
        res.end();
    })
);

router.post(
    "/enrol",
    asyncHandler<{}, {}, EnrolCourseRequestType>(async (req, res) => {
        try {
            const user = await User.findById(req.body.userId);
            if (user) {
                user.courses = req.body.courses;
                user.save();
            }
            res.status(200).end();
        } catch (e) {
            res.status(500).end();
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
