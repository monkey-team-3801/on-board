import React from "react";
import { UploadContainer } from "./UploadContainer";
import { FileUploadType } from "../../types";
import { ProfilePictureContainer } from "../user/ProfilePictureContainer";

// EXAMPLE TEST PAGE. REMOVE WHEN NO LONGER NEEDED.

type Props = {
    userId: string;
};

export const UploadTest = (props: Props) => {
    return (
        <div>
            <UploadContainer
                uploadType={FileUploadType.PROFILE}
            ></UploadContainer>
            <br></br>
            <ProfilePictureContainer {...props}></ProfilePictureContainer>
        </div>
    );
};