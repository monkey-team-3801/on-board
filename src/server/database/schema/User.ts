import mongoose from "mongoose";
import { UserType } from "../../../types";
import { ObjectId } from "mongodb";

export interface IUser extends mongoose.Document {
    _id: ObjectId;
    username: string;
    password: string;
    userType: UserType;
    courses: Array<string>;
    pfp: Buffer;
}

const UserSchema = new mongoose.Schema<IUser>({
    username: { type: String, trim: true, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: UserType, required: true },
    courses: { type: Array, required: true },
    pfp: { type: Buffer, required: false },
});

export const User = mongoose.model<IUser>("User", UserSchema);
