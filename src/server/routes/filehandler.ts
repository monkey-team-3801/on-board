import express from "express";
import { asyncHandler } from "../utils";
import { FileUploadRequestType, FileUploadType } from "../../types";

export const router = express.Router();

router.post(
    "/upload",
    asyncHandler<any, {}, FileUploadRequestType>(async (req, res) => {
        if (req.body.reqType === FileUploadType.PROFILE) {
            console.log(req.body.files);
        }
        if (req.body.reqType === FileUploadType.DOCUMENTS) {
            console.log("documents");
        }
    })
);
