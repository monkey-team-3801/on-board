import mongoose from "mongoose";
import { UserDataResponseType } from "../../../types";

interface ICourseParticipants extends mongoose.Document {
    code: string;
    StudentsList: Array<UserDataResponseType>;
    TutorsList: Array<UserDataResponseType>;
}

const CourseParticipantsSchema = new mongoose.Schema<ICourseParticipants>({
    code: { type: String, required: true, unique: true },
    StudentsList: { type: Array, default: [] },
    TutorsList: { type: Array, default: [] },
});

export const CourseParticipants = mongoose.model<ICourseParticipants>(
    "CourseParticipants",
    CourseParticipantsSchema
);
