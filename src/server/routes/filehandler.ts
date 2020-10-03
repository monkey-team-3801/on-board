import express from "express";
import { asyncHandler } from "../utils";
import { getUserDataFromJWT } from "./utils";
import { User, Session } from "../database/schema";
import { v4 as uuidv4 } from "uuid";
import { io } from "../server";
import { FileStorageType } from "../../types";
import { FileUploadEvent } from "../../events";
import { readFile } from "fs";

export const router = express.Router();

router.get(
    "/file/:sessionId/:fileId",
    asyncHandler<{}, { sessionId: string; fileId: string }>(
        async (req, res) => {
            const session = await Session.findById(req.params.sessionId);
            const file = session?.files?.get(req.params.fileId);
            const contents = file?.file;

            if (contents && file) {
                res.set(
                    "Content-disposition",
                    `attachment; filename=${file.filename}`
                );
                res.set("Content-Type", file.fileExtension);
                res.status(200).end(contents.buffer);
            }
            res.status(500).end();
        }
    )
);

// Upload documents
router.post(
    "/uploadFiles",
    asyncHandler(async (req, res) => {
        if (req.files) {
            // Files to process
            const ftp = Object.keys(req.files).map((x) => req.files![x]);

            const sessionID = ftp[ftp.length - 1];
            if (!Array.isArray(sessionID)) {
                // Get session ID.
                const sid = JSON.parse(sessionID.data.toString())["sid"];
                const sessionQuery = await Session.findById(sid);

                if (sessionQuery) {
                    // Remember to add 1 to all limits since sessionID is always appended to the end of the formdata.
                    if (ftp.length > 1 || ftp.length < 7) {
                        // Maybe a better way to foreach through ftp?
                        let x: number = 0;
                        while (x < ftp.length - 1) {
                            const file = ftp[x];
                            if (!Array.isArray(file)) {
                                sessionQuery.files?.set(uuidv4(), {
                                    filename: file.name,
                                    fileExtension: file.mimetype,
                                    size: file.size,
                                    file: file.data,
                                });
                            }
                            x += 1;
                        }
                        await sessionQuery.save();
                        io.in(sid).emit(FileUploadEvent.NEW_FILE);
                        res.status(200).end();
                    }
                }
            }
        }
        res.status(500).end();
    })
);

// Gets the files for a session
router.post(
    "/getFiles",
    asyncHandler<{ [key: string]: FileStorageType }, {}, { sid: string }>(
        async (req, res) => {
            // TODO MOVE THIS TO SEPARATE FILE SCHEMA
            res.json({});
            // const session = await Session.findById(req.body.sid);
            // if (session) {
            //     const files = session.files;
            //     if (files) {
            //         res.json(Object.fromEntries(files)).status(200).end();
            //     }
            // }
            // res.status(500).end();
        }
    )
);

// Get the user profile picture.
router.get(
    "/getPfp/:userId",
    asyncHandler<undefined, { userId: string }>(async (req, res) => {
        try {
            const user = await User.findById(req.params.userId);
            if (user) {
                const pfp = user.pfp;
                res.contentType("image/jpeg");
                if (pfp.byteLength !== 0) {
                    res.end(pfp, "binary");
                    return;
                }
            }
        } catch {
            //
        }
        readFile("public/default_user.jpg", (err, data) => {
            if (err) {
                res.end();
            } else {
                res.end(data, "binary");
            }
        });
    })
);

// Upload a profile picture.
router.post(
    "/pfpUpload",
    asyncHandler(async (req, res) => {
        if (req.files) {
            // File to process
            const ftp = Object.keys(req.files).map((x) => req.files![x]);
            if (ftp.length > 1) {
                res.status(500).end();
            }
            const file = ftp[0];
            if (!Array.isArray(file)) {
                const fileSize = file.size;
                const fileType = file.mimetype;
                const fileData = file.data;
                // Image verification
                if (
                    verifyImageSignature(fileData) === fileType &&
                    fileSize <= 1000000
                ) {
                    if (req.headers.authorization) {
                        const user = await getUserDataFromJWT(
                            req.headers.authorization
                        );
                        if (user) {
                            user.pfp = fileData;
                            user.save();
                            res.status(200).end();
                        }
                    }
                }
            }
        }
        res.status(500).end();
    })
);

// Currently only accepts jpg and png file types for images. Add more later if needed.
function verifyImageSignature(data: Buffer): string {
    let values: string = data.toString("hex");
    values = values.slice(0, 8);

    // Set this to whatever type in the switch.
    let imgSig: string = "";

    // Verify file signature
    switch (values) {
        // JPEG/JPG
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
            imgSig = "image/jpeg";
            break;
        // PNG
        case "89504e47":
            imgSig = "image/png";
            break;
    }
    return imgSig;
}
