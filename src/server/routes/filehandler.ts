import express from "express";
import { asyncHandler } from "../utils";
import { getUserDataFromJWT } from "./utils";
import { User, Session, ClassroomSession, ISession } from "../database/schema";
import { readFile } from "fs";
import { File, FileResponse } from "../database/schema/File";
import { format } from "date-fns";
import { FileUploadType, RoomType } from "../../types";
import { FileForm, IFileForm } from "../database/schema/ResponseForm";

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
        } else {
            const fileResponse = await FileResponse.findById(req.params.fileId);
            const fileResponseContents = fileResponse?.data;
            if (fileResponse && fileResponseContents) {
                res.set(
                    "Content-disposition",
                    `attachment; filename=${fileResponse.name}`
                );
                res.set("Content-Type", fileResponse.extension);
                res.status(200).end(fileResponseContents);
            }
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
                // extract meta data
                const options = JSON.parse(metaData.data.toString()) as {
                    sid: string;
                    uid: string;
                    roomType: RoomType;
                    uploadType: FileUploadType;
                    formID: string;
                };

                const ftpUpperLimit =
                    options.uploadType === FileUploadType.RESPONSE ? 2 : 6;

                let query: ISession | IFileForm | null = null;

                if (options.uploadType === FileUploadType.RESPONSE) {
                    query = await FileForm.findById(options.formID);
                } else {
                    query =
                        options.roomType === RoomType.CLASS
                            ? await ClassroomSession.findById(options.sid)
                            : await Session.findById(options.sid);
                }

                if (query) {
                    if (ftp.length > 1 && ftp.length <= ftpUpperLimit) {
                        for (let file of ftp) {
                            if (file === metaData) {
                                break;
                            }
                            if (!Array.isArray(file)) {
                                const data = {
                                    name: file.name,
                                    size: file.size,
                                    data: file.data,
                                    extension: file.mimetype,
                                    owner: options.uid,
                                    sessionID: options.sid,
                                    fileTime: format(
                                        new Date(),
                                        "dd/MM hh:mm a"
                                    ),
                                };
                                const newFile =
                                    options.uploadType ===
                                    FileUploadType.RESPONSE
                                        ? await FileResponse.create({
                                              ...data,
                                              formID: options.formID,
                                          })
                                        : await File.create(data);
                                query.files?.push(newFile.id);
                                if (
                                    options.uploadType ===
                                    FileUploadType.RESPONSE
                                ) {
                                    (query as IFileForm).answered.push(
                                        newFile.owner
                                    );
                                }
                            }
                        }
                    }
                    if (options.uploadType === FileUploadType.RESPONSE) {
                        await (query as IFileForm).save();
                    } else {
                        await (query as ISession).save();
                    }
                    res.status(200).end();
                    return;
                }
                res.status(500).end();
            }
        }
    })
);

// Gets the files for a session
router.post(
    "/getFiles",
    asyncHandler<
        Array<{
            id: string;
            name: string;
            size: number;
            time: string;
            userId: string;
            username: string;
        }>,
        {},
        { id: string; roomType: RoomType; fileUploadType: FileUploadType }
    >(async (req, res) => {
        const roomType = req.body.roomType;
        const fileUploadType = req.body.fileUploadType;

        let queryType: ISession | IFileForm | null;

        if (fileUploadType === FileUploadType.RESPONSE) {
            queryType = await FileForm.findById(req.body.id);
        } else {
            queryType =
                roomType === RoomType.CLASS
                    ? await ClassroomSession.findById(req.body.id)
                    : await Session.findById(req.body.id);
        }

        if (queryType && queryType.files) {
            const data = await Promise.all(
                queryType.files.map(async (fileId) => {
                    const file =
                        req.body.fileUploadType === FileUploadType.RESPONSE
                            ? await FileResponse.findById(fileId)
                            : await File.findById(fileId);
                    const user = await User.findById(file?.owner);
                    return {
                        id: fileId,
                        name: file?.name,
                        size: file?.size,
                        time: file?.fileTime,
                        userId: user?.id,
                        username: user?.username,
                    } as {
                        id: string;
                        name: string;
                        size: number;
                        time: string;
                        userId: string;
                        username: string;
                    };
                })
            );
            res.send(data).status(200).end();
        } else {
            res.status(500).end();
        }
    })
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
