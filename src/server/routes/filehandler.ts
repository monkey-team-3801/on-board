import express from "express";
import { asyncHandler } from "../utils";
import { getUserDataFromJWT } from "./utils";
import { User, Session } from "../database/schema";

export const router = express.Router();

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
                    console.log("b");
                    if (ftp.length > 1 || ftp.length < 7) {
                        console.log("a");
                        // Need a better way to foreach through ftp?
                        let x: number = 0;
                        while (x < ftp.length - 1) {
                            const file = ftp[x];
                            if (!Array.isArray(file)) {
                                console.log("c");
                                sessionQuery.files?.push(file.data);
                            }
                            x += 1;
                        }
                        console.log("test");
                    }
                    sessionQuery.save();
                }
            }
        }
        res.end();
    })
);

// Gets the files for a session
router.get(
    "/getFiles",
    asyncHandler(async (req, res) => {
        console.log("test");
        res.end();
    })
);

// Get the user profile picture.
router.get(
    "/getPfp/:userId",
    asyncHandler<undefined, { userId: string }, any>(async (req, res) => {
        const user = await User.findById(req.params.userId);
        if (user) {
            const pfp = user.pfp;
            if (pfp) {
                res.end(pfp, "binary");
            }
        }
        res.end();
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
