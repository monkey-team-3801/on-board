import express from "express";
import { asyncHandler } from "../utils";
import { getUserDataFromJWT } from "./utils";
import { User, Session } from "../database/schema";
import { readFile } from "fs";
import { File } from "../database/schema/File";
import { format } from "date-fns";

export const router = express.Router();

router.get(
    "/file/:fileId",
    asyncHandler<{}, { fileId: string }>(async (req, res) => {
        const file = await File.findById(req.params.fileId);
        const contents = file?.data;

        if (contents && file) {
            res.set("Content-disposition", `attachment; filename=${file.name}`);
            res.set("Content-Type", file.extension);
            res.status(200).end(contents);
        }
        res.status(500).end();
    })
);

// Upload documents
router.post(
    "/uploadFiles",
    asyncHandler<undefined, {}, FormData>(async (req, res) => {
        if (req.files) {
            // Files to process
            const ftp = Object.keys(req.files).map((x) => req.files![x]);

            const metaData = ftp[ftp.length - 1];

            if (!Array.isArray(metaData)) {
                // Session and User ID.
                const sid = JSON.parse(metaData.data.toString())["sid"];
                const uid = JSON.parse(metaData.data.toString())["uid"];

                const sessionQuery = await Session.findById(sid);

                if (sessionQuery) {
                    // Limits. Always add 1 to the length.
                    if (ftp.length > 1 || ftp.length < 7) {
                        for (let file of ftp) {
                            if (file === metaData) {
                                break;
                            }
                            if (!Array.isArray(file)) {
                                const newFile = await File.create({
                                    name: file.name,
                                    size: file.size,
                                    data: file.data,
                                    extension: file.mimetype,
                                    owner: uid,
                                    sessionID: sid,
                                    fileTime: format(
                                        new Date(),
                                        "dd/MM hh:mm a"
                                    ),
                                });
                                sessionQuery.files?.push(newFile.id);
                            }
                        }
                        await sessionQuery.save();
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
    asyncHandler<Array<Array<string>>, {}, { sid: string }>(
        async (req, res) => {
            const session = await Session.findById(req.body.sid);

            if (session && session.files) {
                const data = (
                    await Promise.all(
                        session.files.map(async (fileId) => {
                            const file = await File.findById(fileId);
                            return [
                                fileId,
                                file?.name,
                                file?.size.toString(),
                                file?.fileTime,
                                file?.owner,
                            ] as [string, string, string, string, string];
                        })
                    )
                ).filter(
                    (data): data is [string, string, string, string, string] =>
                        data[0] !== undefined &&
                        data[1] !== undefined &&
                        data[2] !== undefined &&
                        data[3] !== undefined &&
                        data[4] !== undefined
                );
                res.send(data).status(200).end();
            } else {
                res.status(500).end();
            }
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
                console.log(err);
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

router.post(
    "/deleteFile",
    asyncHandler<undefined, {}, { sid: string; fileId: string; uid: string }>(
        async (req, res) => {
            const fileQuery = await File.findById(req.body.fileId);
            const sessionQuery = await Session.findById(req.body.sid);

            if (fileQuery && sessionQuery) {
                if (fileQuery.owner !== req.body.uid) {
                    res.status(500).end();
                } else if (!sessionQuery.files?.includes(fileQuery.id)) {
                    res.status(500).end();
                } else if (fileQuery.sessionID !== sessionQuery.id) {
                    res.status(500).end();
                } else {
                    await sessionQuery.updateOne({
                        $pull: { files: fileQuery.id },
                    });
                    await fileQuery.deleteOne();
                    await sessionQuery.save();
                    res.status(200).end();
                }
            }
        }
    )
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
