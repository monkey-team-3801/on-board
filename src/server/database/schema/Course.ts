import mongoose from "mongoose";
import {
    CourseActivity,
    CourseAnnouncementsType,
} from "../../../types";

interface ICourse extends mongoose.Document {
    code: string;
    description: string;
    activities: Array<CourseActivity>;
    announcements: Array<CourseAnnouncementsType & { username: string }>;
}

const CourseSchema = new mongoose.Schema<ICourse>({
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    activities: { type: Array, default: [] },
    announcements: { type: Array, default: [] },
});

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
