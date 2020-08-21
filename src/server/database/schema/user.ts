import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    id: {},
    username: {},
    password: {},
});

export const user = mongoose.model("user", UserSchema);
