import express from "express";

import { asyncHandler } from "../utils";
import { Course } from "../database";
import {
    CourseActivityResponseType,
    CourseActivityUnique,
    CourseResponseType,
    CourseDataUnique,
    CoursesResponseType,
    CourseActivityRequestFilterType,
} from "../../types";
import { addWeeks } from "date-fns";

export const router = express.Router();

router.get(
    "/:course_code",
    asyncHandler<CourseResponseType, { course_code: string }, {}>(
        async (req, res) => {
            try {
                const course = await Course.findOne({
                    code: req.params.course_code,
                });
                if (course === null) {
                    res.status(404).end();
                    return;
                }
                res.json({
                    code: course.code,
                    description: course.description,
                    activities: course.activities,
                });
            } catch (e) {
                console.log("error", e);
                res.status(500).end();
            }
        }
    )
);

router.get(
    "/",
    asyncHandler<CoursesResponseType, {}, {}>(async (req, res) => {
        try {
            const query = await Course.find();
            const courses: Array<CourseResponseType> = query.map((course) => ({
                code: course.code,
                description: course?.description,
                activities: course?.activities,
            }));
            res.json(courses);
        } catch (e) {
            console.log("error", e);
            res.status(500).end();
        }
    })
);

router.post(
    "/create",
    asyncHandler<CourseResponseType, {}, CourseDataUnique>(async (req, res) => {
        try {
            const { code, description } = req.body;
            const course = await Course.create({
                code,
                description,
                activities: [],
            });
            res.status(200).json(course);
        } catch (e) {
            console.log("error", e);
            res.status(500).end();
        }
    })
);

router.delete(
    "/delete/:course_code",
    asyncHandler<CourseResponseType, { course_code: string }, {}>(
        async (req, res) => {
            const course = await Course.findOneAndDelete(req.params);
            if (course === null) {
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
        if (course === null) {
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
        if (course === null) {
            res.status(404).end();
            return;
        }
        course.activities = [...course.activities, req.body];
        course.save();
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
        if (course === null) {
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
        course.save();
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
        if (course === null) {
            res.status(404).end();
            return;
        }
        res.json(
            course.activities.filter((activity) => {
                const codeFilter = req.body.code || activity.code;
                const typeFilter = req.body.type || activity.type;
                const { chosenYear, chosenMonth } = req.body.filter;
                let timeFilter = false;
                // @ts-ignore
                // TODO: type fix?
                for (const [i, weekOn] of activity.weeks.entries()) {
                    if (weekOn === 0) continue;
                    const sessionDate: Date = addWeeks(activity.startDate, i);
                    if (
                        sessionDate.getFullYear() === chosenYear &&
                        sessionDate.getMonth() === chosenMonth
                    ) {
                        timeFilter = true;
                        break;
                    }
                }
                return (
                    activity.code === codeFilter &&
                    activity.type === typeFilter &&
                    timeFilter
                );
            })
        );
    })
);
