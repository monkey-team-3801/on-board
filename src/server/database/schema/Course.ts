import mongoose from "mongoose";
import { CourseActivityResponseType } from "../../../types";

interface ICourse extends mongoose.Document {
    code: string;
    description: string;
    activities: Array<CourseActivityResponseType>;
}

const CourseSchema = new mongoose.Schema<ICourse>({
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    activities: { type: Array, default: [] },
});

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
