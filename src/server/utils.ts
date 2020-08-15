import { ParamsDictionary } from "express-serve-static-core";
import { NextFunction, RequestHandler, Request, Response } from "express";
import { AnyObjectMap } from "./types";

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
    T extends AnyObjectMap<any> | string = {},
    S extends ParamsDictionary = {},
    V extends AnyObjectMap<any> = {}
>(
    handler: (
        req: Request<S, T, V>,
        res: Response<T>,
        next: NextFunction
    ) => Promise<void> | void
): RequestHandler<S, T, V> => {
    return (
        req: Request<S, T, V>,
        res: Response<T>,
        next: NextFunction
    ): Promise<void> | void => {
        return Promise.resolve(handler(req, res, next));
    };
};
