import express from "express";

import { asyncHandler } from "../utils";
import { Course } from "../database";
import {
    CourseActivity,
    CourseActivityUnique,
    CourseResponseType,
    CoursesResponseType,
    CourseActivityRequestFilterType,
    CourseListResponseType,
    GetAnnouncementsRequestType,
    GetAnnouncementsResponseType,
    CourseActivityResponseType,
    UserType,
    UserDataResponseType,
} from "../../types";
import { addWeeks, setISODay } from "date-fns";
import { User } from "../database/schema";
import { getUserDataFromJWT } from "./utils";

export const router = express.Router();

/**
 * Finds all courses stored in the collection.
 */
const findAllCourses = async (): Promise<Array<CourseResponseType>> => {
    const query = await Course.find();
    return query.map((course) => ({
        code: course.code,
        description: course.description,
        activities: course.activities,
        announcements: course.announcements,
    }));
};

/**
 * Base route to get all courses data.
 */
router.get(
    "/",
    asyncHandler<CoursesResponseType, {}, {}>(async (req, res, next) => {
        try {
            res.json(await findAllCourses());
        } catch (e) {
            res.status(500);
            next(new Error("Unexpected error has occured."));
        }
    })
);

/**
 * Gets a list of available course codes.
 */
router.post(
    "/list",
    asyncHandler<CourseListResponseType>(async (req, res, next) => {
        try {
            res.json(
                (await findAllCourses()).map((course) => {
                    return {
                        code: course.code,
                    };
                })
            );
        } catch (e) {
            res.status(500);
            next(new Error("Unexpected error has occured."));
        }
    })
);

/**
 * Gets the activities associated with the courses a user is enrolled in.
 */
router.get(
    "/enrolled-activities",
    asyncHandler<
        CourseActivityResponseType,
        {},
        CourseActivityRequestFilterType
    >(async (req, res) => {
        if (req.headers.authorization) {
            const user = await getUserDataFromJWT(req.headers.authorization);
            const courses = await Course.find({
                code: {
                    $in: user?.courses,
                },
            });
            const activities = courses.reduce(
                (currentActivities: CourseActivityResponseType, newCourse) => {
                    return {
                        ...currentActivities,
                        [newCourse.code]: newCourse.activities,
                    };
                },
                {}
            );
            res.json(activities);
        }
        res.end();
    })
);

/**
 * Gets the announcements associated with a course.
 */
router.post(
    "/announcements",
    asyncHandler<GetAnnouncementsResponseType, {}, GetAnnouncementsRequestType>(
        async (req, res) => {
            const user = await User.findById(req.body.userId);
            if (user) {
                const courseAnnouncements = user.courses.map(
                    async (courseCode) => {
                        const courses = await Course.find({
                            code: courseCode,
                        });
                        if (courses) {
                            const announcements = courses.flatMap((course) => {
                                return course.announcements.map(
                                    (announcement) => announcement
                                );
                            });
                            return announcements;
                        }
                        return [];
                    }
                );
                const allAnnouncements = (
                    await Promise.all(courseAnnouncements)
                )
                    .reduce((prev, next) => {
                        return prev.concat(next || []);
                    }, [])
                    .sort((a, b) => {
                        return (
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                        );
                    });
                res.json({
                    announcements: allAnnouncements,
                });
            }
            res.end();
        }
    )
);

/**
 * Deletes a single announcement in a course.
 */
router.post(
    "/announcements/delete",
    asyncHandler<{}, {}, { id: string; courseCode: string }>(
        async (req, res) => {
            try {
                await Course.findOneAndUpdate(
                    { code: req.body.courseCode },
                    {
                        $pull: {
                            announcements: {
                                id: req.body.id,
                            },
                        },
                    }
                );
            } catch (e) {
                res.status(500);
            } finally {
                res.status(200).end();
            }
        }
    )
);

/**
 * Deletes a course from the collection.
 */
router.delete(
    "/delete/:course_code",
    asyncHandler<CourseResponseType, { course_code: string }, {}>(
        async (req, res) => {
            const course = await Course.findOneAndDelete(req.params);
            if (!course) {
                res.status(404).end();
                return;
            }
            res.status(204).json(course);
        }
    )
);

/**
 * Updates a course from the collection.
 */
router.patch(
    "/update/:course_code",
    asyncHandler<
        CourseResponseType,
        { course_code: string },
        { code?: string; description?: string }
    >(async (req, res) => {
        const course = await Course.findOneAndUpdate(req.params, req.body);
        if (!course) {
            res.status(404).end();
            return;
        }
        res.status(200).json(course);
    })
);

/**
 * Gets information associated with a course code.
 */
router.get(
    "/:course_code",
    asyncHandler<CourseResponseType, { course_code: string }, {}>(
        async (req, res, next) => {
            try {
                const course = await Course.findOne({
                    code: req.params.course_code,
                });
                if (!course) {
                    res.status(404).end();
                    return;
                }
                res.json({
                    code: course.code,
                    description: course.description,
                    activities: course.activities,
                    announcements: course.announcements,
                });
            } catch (e) {
                res.status(500).end();
            }
        }
    )
);
// TODO: Unique constraint
/**
 * Adds an activity to a course.
 */
router.post(
    "/:course_code/add-activity",
    asyncHandler<CourseActivity, { course_code: string }, CourseActivity>(
        async (req, res) => {
            const course = await Course.findOne(req.params);
            if (!course) {
                res.status(404).end();
                return;
            }
            course.activities = [...course.activities, req.body];
            await course.save();
            res.status(200).json(req.body);
        }
    )
);

/**
 * Deletes an activity from a course.
 */
router.delete(
    "/:course_code/delete-activity",
    asyncHandler<
        Array<CourseActivity>,
        { course_code: string },
        CourseActivityUnique
    >(async (req, res) => {
        const course = await Course.findOne(req.params);
        if (!course) {
            res.status(404).end();
            return;
        }
        const removed = course.activities.filter(
            (activity) =>
                activity.code !== req.body.code &&
                activity.type !== req.body.type
        );
        course.activities = course.activities.filter(
            (activity) =>
                activity.code === req.body.code &&
                activity.type === req.body.type
        );
        await course.save();
        res.status(200).json(removed);
    })
);

/**
 * Gets activities associated with a course.
 */
router.get(
    "/:course_code/activities",
    asyncHandler<
        Array<CourseActivity>,
        { course_code: string },
        CourseActivityRequestFilterType
    >(async (req, res) => {
        const course = await Course.findOne(req.params);
        if (!course) {
            res.status(404).end();
            return;
        }
        res.json(
            course.activities.filter((activity) => {
                const codeFilter = req.body.code || activity.code;
                const typeFilter = req.body.type || activity.type;
                const { chosenYear, chosenMonth } = req.body.filter;

                return activity.weeks.some((weekOn, i) => {
                    if (weekOn === 0) return false;
                    const sessionDate: Date = setISODay(
                        addWeeks(activity.startDate, i),
                        activity.dayOfWeek
                    );
                    return (
                        activity.code === codeFilter &&
                        activity.type === typeFilter &&
                        sessionDate.getFullYear() === chosenYear &&
                        sessionDate.getMonth() === chosenMonth
                    );
                });
            })
        );
    })
);

/**
 * Retrieves details associated with the course, incorporating other schemas.
 */
router.post(
    "/details",
    asyncHandler<
        { [key: string]: Array<Omit<UserDataResponseType, "courses">> },
        {},
        { courses: Array<string> }
    >(async (req, res) => {
        try {
            if (req.headers.authorization) {
                const user = await getUserDataFromJWT(
                    req.headers.authorization
                );
                if (user) {
                    const courseUserMap = new Map<
                        string,
                        Array<Omit<UserDataResponseType, "courses">>
                    >();

                    await Promise.all(
                        req.body.courses.map(async (course) => {
                            const courseUsers = await User.find({
                                $or: [
                                    { userType: UserType.COORDINATOR },
                                    { userType: UserType.TUTOR },
                                ],
                                courses: {
                                    $in: req.body.courses,
                                },
                            });
                            courseUserMap.set(
                                course,
                                courseUsers.map((user) => {
                                    return {
                                        id: user._id.toHexString(),
                                        username: user.username,
                                        userType: user.userType,
                                    };
                                })
                            );
                        })
                    );
                    res.status(200).json(Object.fromEntries(courseUserMap));
                }
            }
        } catch (e) {
            res.status(500);
        } finally {
            res.end();
        }
    })
);
