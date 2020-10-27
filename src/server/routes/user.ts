import express from "express";

import { User, SessionUsers } from "../database/schema";
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

/**
 * Route to get basic user data such as their id, name, type and courses they are enrolled in.
 */
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

/**
 * Enrols a user in to the specified courses.
 */
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

/**
 * Gets the only courses a user is enrolled in.
 */
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

/**
 * Route to get user data by id.
 */
router.post(
    "/getUserById",
    asyncHandler<UserDataResponseType | undefined, {}, { userID: string }>(
        async (req, res) => {
            const user = await User.findById(req.body.userID);

            if (user) {
                res.json({
                    id: user._id.toHexString(),
                    username: user.username,
                    userType: user.userType,
                    courses: user.courses,
                });
            }
            res.end();
        }
    )
);

/**
 * Route to find all users associated with a course.
 */
router.post(
    "/getAllUserInCourse",
    asyncHandler<Array<UserDataResponseType>, {}, { userID: string }>(
        async (req, res) => {
            try {
                if (req.headers.authorization) {
                    const currentUser = await getUserDataFromJWT(
                        req.headers.authorization
                    );
                    const users = await User.find({
                        courses: {
                            $in: currentUser?.courses || [],
                        },
                    })
                        .select("username")
                        .select("userType")
                        .select("_id")
                        .select("courses");
                    res.json(
                        users.map((user) => {
                            return {
                                id: user._id.toHexString(),
                                username: user.username,
                                userType: user.userType,
                                courses: user.courses,
                            };
                        })
                    );
                }
                res.status(200);
            } catch (e) {
                res.status(500);
            } finally {
                res.end();
            }
        }
    )
);

/**
 * Route to find users which are online.
 */
router.post(
    "/online",
    asyncHandler<Array<string>>(async (req, res) => {
        try {
            const users = await SessionUsers.findOne({ sessionId: "global" });
            res.json(Array.from(users?.userReferenceMap.keys() || [])).status(
                200
            );
        } catch (e) {
            res.status(500);
        } finally {
            res.end();
        }
    })
);

/**
 * Route to change the username of a user.
 */
router.post(
    "/changeUsername",
    asyncHandler<undefined, {}, { userID: string; newName: string }>(
        async (req, res, next) => {
            try {
                const newNameQuery = await User.findOne({
                    username: req.body.newName,
                });
                if (newNameQuery) {
                    throw new Error();
                } else {
                    await User.findByIdAndUpdate(req.body.userID, {
                        username: req.body.newName,
                    });
                    res.status(200);
                }
            } catch (e) {
                res.status(500);
                next(new Error("Username is already taken"));
            } finally {
                res.end();
            }
        }
    )
);

/**
 * Route to change the password of a user.
 */
router.post(
    "/changePassword",
    asyncHandler<undefined, {}, { userID: string; password: string }>(
        async (req, res) => {
            try {
                await User.findByIdAndUpdate(req.body.userID, {
                    password: hashPassword(req.body.password),
                });
                res.status(200).end();
            } catch (e) {
                res.status(500).end();
            }
        }
    )
);
