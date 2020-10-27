import express from "express";

import { getUserDataFromJWT } from "./utils";

export const router = express.Router();

/**
 * Authorisation route.
 */
router.use("/", async (req, res) => {
    if (req.headers.authorization) {
        try {
            const user = await getUserDataFromJWT(req.headers.authorization);
            if (user) {
                return res.status(202).end();
            }
        } catch (e) {
            return res.status(401).end();
        }
    }
    return res.status(401).end();
});
