import { ParamsDictionary } from "express-serve-static-core";
import { NextFunction, RequestHandler, Request, Response } from "express";
import {
    AnyObjectMap,
    BaseJob,
    AnnouncementJob,
    ClassOpenJob,
    RoomType,
} from "../types";
import { ExecutingEvent } from "../events";
import { Session } from "./database";
import { ClassroomSession } from "./database/schema";
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

export const isAnnouncementJob = (job: BaseJob): job is AnnouncementJob => {
    return job.executingEvent === ExecutingEvent.ANNOUNCEMENT;
};

export const isClassOpenJob = (job: BaseJob): job is ClassOpenJob => {
    return job.executingEvent === ExecutingEvent.CLASS_OPEN;
};

export const createNewSession = async (
    name: string,
    description: string,
    courseCode?: string
) => {
    const session = await Session.create({
        name,
        messages: [],
        roomType: RoomType.PRIVATE,
        description,
        courseCode,
    });
    return session;
};

export const createNewClassroomSession = async (
    name: string,
    description: string,
    courseCode: string,
    startTime: string,
    endTime: string
) => {
    const session = await ClassroomSession.create({
        name,
        messages: [],
        roomType: RoomType.CLASS,
        description,
        courseCode,
        startTime,
        endTime,
    });
    await VideoSession.create({
        sessionId: session._id,
        userPeerMap: new Map(),
        userReferenceMap: new Map(),
        numScreensAllowed: 1,
        sharingUsers: []
    });
    return session;
};
