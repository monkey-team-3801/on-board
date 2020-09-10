import express from "express";
import { asyncHandler } from "../utils";
import { getUserDataFromJWT } from "./utils";

export const router = express.Router();

router.post(
    "/pfpUpload",
    asyncHandler(async (req, res) => {
        if (req.files) {
            // File to process
            const ftp = Object.keys(req.files).map((x) => req.files![x]);
            if (ftp.length > 1) {
                // naughty boy
                res.status(500).end();
            }
            const file = ftp[0];
            console.log(ftp);
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
                            const userID = user._id;
                        }
                    }
                }
            }
        }

        res.end();
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
