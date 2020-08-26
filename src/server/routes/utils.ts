import jwt from "jsonwebtoken";
import SHA3 from "sha3";

import { User, IUser } from "../database/schema";

export const generateJWT = (userId: string): string => {
    return jwt.sign(userId, process.env.JWT_SECRET || "monkey_default_jwt");
};

export const getUserDataFromJWT = async (
    token: string
): Promise<IUser | null> => {
    const userId: string = jwt.verify(
        token,
        process.env.JWT_SECRET || "monkey_default_jwt"
    ) as string;
    return await User.findById(userId);
};

export const hashPassword = (password: string): string => {
    const hash = new SHA3();
    hash.update(password);
    return hash.digest("hex");
};
