import jwt from "jsonwebtoken";
import SHA3 from "sha3";

import { User, IUser, ClassroomSession } from "../database/schema";
import { ClassroomSessionData } from "../../types";

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

export const getAllClassroomSessions = async (
    currentUser: IUser,
    status?: "open" | "upcoming",
    limit?: number
): Promise<Array<ClassroomSessionData & { createdByUsername?: string }>> => {
    try {
        const query = status
            ? {
                  open: status === "open" ? true : false,
              }
            : {};
        const sessions = await ClassroomSession.find(query).sort({
            startTime: -1,
        });
        if (sessions) {
            const query = await Promise.all(
                sessions.map(async (session) => {
                    const user = await User.findById(session.createdBy);
                    return {
                        id: session._id,
                        name: session.name,
                        roomType: session.roomType,
                        description: session.description,
                        courseCode: session.courseCode,
                        messages: session.messages,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        colourCode: session.colourCode,
                        createdBy: session.createdBy,
                        createdByUsername: user?.username,
                        open: session.open,
                    };
                })
            );
            return query.filter((session) => {
                return currentUser.courses.includes(session.courseCode);
            });
        }
        return [];
    } catch (e) {
        throw new Error("Unexpected error has occured.");
    }
};
