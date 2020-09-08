import mongoose from "mongoose";
<<<<<<< HEAD
import { CourseActivityResponseType } from "../../../types";
import { UserDataResponseType} from "../../../types";
=======
import {
    CourseActivityResponseType,
    CourseAnnouncementsType,
} from "../../../types";
>>>>>>> master

interface ICourse extends mongoose.Document {
    code: string;
    description: string;
    activities: Array<CourseActivityResponseType>;
<<<<<<< HEAD
    StudentsList: Array<UserDataResponseType>;
    TutorsList: Array<UserDataResponseType>;
=======
    announcements: Array<CourseAnnouncementsType>;
>>>>>>> master
}

const CourseSchema = new mongoose.Schema<ICourse>({
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    activities: { type: Array, default: [] },
<<<<<<< HEAD
    StudentsList: { type: Array, default: [] },
    TutorsList: { type: Array, default: [] },
=======
    announcements: { type: Array, default: [] },
>>>>>>> master
});

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
