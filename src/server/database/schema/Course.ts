import mongoose from "mongoose";
import { UserDataResponseType} from "../../../types";
import {
    CourseActivityResponseType,
    CourseAnnouncementsType,
} from "../../../types";

interface ICourse extends mongoose.Document {
    code: string;
    description: string;
    activities: Array<CourseActivityResponseType>;
    StudentsList: Array<UserDataResponseType>;
    TutorsList: Array<UserDataResponseType>;
    announcements: Array<CourseAnnouncementsType>;
}

const CourseSchema = new mongoose.Schema<ICourse>({
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    activities: { type: Array, default: [] },
    StudentsList: { type: Array, default: [] },
    TutorsList: { type: Array, default: [] },
    announcements: { type: Array, default: [] },
});

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
