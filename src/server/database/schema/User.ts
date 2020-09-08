import mongoose from "mongoose";
import { UserType, UserStatus } from "../../../types";
import { ObjectId } from "mongodb";

export interface IUser extends mongoose.Document {
    _id: ObjectId;
    username: string;
    password: string;
    userType: UserType;
    userStatus: UserStatus;
    courses: Array<string>;
}

const UserSchema = new mongoose.Schema<IUser>({
    username: { type: String, trim: true, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: UserType, required: true },
    userStatus: { type: UserStatus },
    courses: { type: Array, required: true },
});

export const User = mongoose.model<IUser>("User", UserSchema);
