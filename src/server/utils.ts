import { NextFunction, Request, RequestHandler, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ExecutingEvent } from "../events";
import {
    AnnouncementJob,
    AnyObjectMap,
    BaseJob,
    ClassOpenJob,
    ClassroomSessionData,
    UpcomingClassroomSessionData,
    CreateClassroomJobRequestType,
    CreateAnnouncementJobRequestType,
    AnyJobRequestType,
} from "../types";
import { Session } from "./database";
import { ClassroomSession, SessionUsers } from "./database/schema";
import { VideoSession } from "./database/schema/VideoSession";

/**
 * T: Response data type.
 * S: Request parameters.
 * V: Request body.
 * @param handler Standard express request handler.
 * Example
 * app.use(asyncHandler<{ data: string }>(req, res) => {
 *     res.send({ data: number }); // error
 * })
 */
export const asyncHandler = <
    T extends AnyObjectMap<any> | string | undefined = undefined,
    S extends ParamsDictionary = {},
    V extends AnyObjectMap<any> = {}
>(
    handler: (
        req: Request<S, T | undefined, V>,
        res: Response<T | undefined>,
        next: NextFunction
    ) => Promise<void> | void
): RequestHandler<S, T | undefined, V> => {
    return (
        req: Request<S, T | undefined, V>,
        res: Response<T | undefined>,
        next: NextFunction
    ): Promise<void> | void => {
        return Promise.resolve(handler(req, res, next));
    };
};

/**
 * Type guard to check if a job is a announcement job.
 * @param job Base job.
 */
export const isAnnouncementJob = (job: BaseJob): job is AnnouncementJob => {
    return job.executingEvent === ExecutingEvent.ANNOUNCEMENT;
};

/**
 * Type guard to check if a job is a class open job.
 * @param job Base job.
 */
export const isClassOpenJob = (job: BaseJob): job is ClassOpenJob => {
    return job.executingEvent === ExecutingEvent.CLASS_OPEN;
};

/**
 * Type guard to check if a request is a class open request.
 * @param type Base request type.
 */
export const isCreateClassroomRequestType = (
    type: AnyJobRequestType
): type is CreateClassroomJobRequestType => {
    return type.executingEvent === ExecutingEvent.CLASS_OPEN;
};

/**
 * Type guard to check if a request is a create announcement request.
 * @param type Base request type.
 */
export const isCreateAnnouncementRequestType = (
    type: AnyJobRequestType
): type is CreateAnnouncementJobRequestType => {
    return type.executingEvent === ExecutingEvent.ANNOUNCEMENT;
};

/**
 * Helper to create a single session.
 * @param name Name of the room.
 * @param description Description of the room.
 * @param createdBy User that created the room.
 * @param courseCode Course assocaited with the room.
 */
export const createNewSession = async (
    name: string,
    description: string,
    createdBy: string,
    courseCode?: string
) => {
    const session = await Session.create({
        name,
        messages: [],
        description,
        courseCode,
        files: [],
        createdBy,
    });
    await VideoSession.create({
        sessionId: session._id,
        userPeerMap: new Map(),
        userReferenceMap: new Map(),
        numScreensAllowed: 1,
        sharingUsers: [],
    });
    return session;
};

/**
 * Helper to create a single classroom.
 * @param data Classroom data.
 * @param createdBy User that created the room.
 */
export const createNewClassroomSession = async (
    data: CreateClassroomJobRequestType,
    createdBy: string
) => {
    const session = await ClassroomSession.create({
        name: data.name,
        messages: [],
        roomType: data.roomType,
        description: data.description,
        courseCode: data.courseCode,
        startTime: data.startTime,
        endTime: data.endTime,
        raisedHandUsers: [],
        files: [],
        colourCode: data.colourCode,
        createdBy,
        open: false,
    });
    await SessionUsers.create({
        sessionId: session._id,
        userReferenceMap: new Map(),
    });
    // TODO MOVE VIDEO SESSION USER REFERENCE TO SESSION USERS SCHEMA.
    await VideoSession.create({
        sessionId: session._id,
        userPeerMap: new Map(),
        userReferenceMap: new Map(),
        numScreensAllowed: 1,
        sharingUsers: [],
    });
    return session;
};

/**
 * Checks if the creation of a classroom has a error
 * @param data Classroom form data.
 */
export const classFormDataHasError = (
    data:
        | Omit<ClassroomSessionData, "open" | "messages" | "id">
        | UpcomingClassroomSessionData
): string | undefined => {
    if (!data.name) {
        return "Room name should not be empty";
    }
    if (!data.courseCode) {
        return "Course should not be empty";
    }
    if (new Date(data.endTime).getTime() < new Date(data.startTime).getTime()) {
        return "Class should not end before it starts";
    }
};
