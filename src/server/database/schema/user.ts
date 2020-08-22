import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, trim: true, required: true },
    password: { type: String, required: true },
});

export const User = mongoose.model("User", UserSchema);
