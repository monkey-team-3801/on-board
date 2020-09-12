import React from "react";
import { UploadContainer } from "./UploadContainer";
import { FileUploadType } from "../../types";
import { ProfilePictureContainer } from "../user/ProfilePictureContainer";

// REMOVE THIS FILE WHEN TEMP/TESTING IS NO LONGER NEEDED.

type Props = {
    userId: string;
};

export const UploadTest = (props: Props) => {
    return (
        <div>
            <UploadContainer
                uploadType={FileUploadType.DOCUMENTS}
            ></UploadContainer>
            <br></br>
            <ProfilePictureContainer {...props}></ProfilePictureContainer>
        </div>
    );
};
