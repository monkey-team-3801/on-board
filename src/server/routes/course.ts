import express from "express";

import { asyncHandler } from "../utils";
import { Course } from "../database";
import {
    CourseActivityResponseType,
    CourseActivityUnique,
    CourseResponseType,
    CoursesResponseType,
    CourseActivityRequestFilterType,
    CourseListResponseType,
    GetAnnouncementsRequestType,
    GetAnnouncementsResponseType,
} from "../../types";
import { addWeeks, setISODay } from "date-fns";
import { User } from "../database/schema";

export const router = express.Router();

const findAllCourses = async (): Promise<Array<CourseResponseType>> => {
    const query = await Course.find();
    return query.map((course) => ({
        code: course.code,
        description: course.description,
        activities: course.activities,
    }));
};

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
                });
            } catch (e) {
                res.status(500).end();
            }
        }
    )
);

router.get(
    "/",
    asyncHandler<CoursesResponseType, {}, {}>(async (req, res, next) => {
        try {
            res.json(await findAllCourses());
        } catch (e) {
            console.log("error", e);
            res.status(500);
            next(new Error("Unexpected error has occured."));
        }
    })
);

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
            console.log("error", e);
            res.status(500);
            next(new Error("Unexpected error has occured."));
        }
    })
);

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

// TODO: Unique constraint
router.post(
    "/:course_code/add-activity",
    asyncHandler<
        CourseActivityResponseType,
        { course_code: string },
        CourseActivityResponseType
    >(async (req, res) => {
        const course = await Course.findOne(req.params);
        if (!course) {
            res.status(404).end();
            return;
        }
        course.activities = [...course.activities, req.body];
        await course.save();
        res.status(200).json(req.body);
    })
);

router.delete(
    "/:course_code/delete-activity",
    asyncHandler<
        Array<CourseActivityResponseType>,
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

router.get(
    "/:course_code/activities",
    asyncHandler<
        Array<CourseActivityResponseType>,
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
                        activity.day_of_week
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
