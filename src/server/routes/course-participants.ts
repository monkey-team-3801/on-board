import express from "express";

import { asyncHandler } from "../utils";
import { CourseParticipants } from "../database";
import { CourseParticipantsResponseType } from "../../types";

//import { addWeeks, setISODay } from "date-fns";

export const router = express.Router();

router.get(
    "/courseparticipants/:course_code",
    asyncHandler<CourseParticipantsResponseType, { course_code: string }, {}>(
        async (req, res) => {
            try {
                const courseparticipants = await CourseParticipants.findOne({
                    code: req.params.course_code,
                });
                if (!courseparticipants) {
                    res.status(404).end();
                    return;
                }
                res.json({
                    code: courseparticipants.code,
                    StudentsList: courseparticipants.StudentsList,
                    TutorsList: courseparticipants.TutorsList,
                });
            } catch (e) {
                console.log("error", e);
                res.status(500).end();
            }
        }
    )
);
