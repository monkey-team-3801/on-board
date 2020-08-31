import mongoose from "mongoose";
import { UserType } from "../../../types";
import { ObjectId } from "mongodb";

export interface IUser extends mongoose.Document {
    _id: ObjectId;
    username: string;
    password: string;
    userType: UserType;
    courseList: Array<String>;
}

const UserSchema = new mongoose.Schema<IUser>({
    username: { type: String, trim: true, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: UserType, required: true },
    courseList: { type: Array, default: [] },
});

export const User = mongoose.model<IUser>("User", UserSchema);
