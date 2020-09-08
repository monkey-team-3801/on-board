import React from "react";
import { UploadContainer } from "./UploadContainer";
import { FileUploadType } from "../../types";

export const UploadTest = () => {
    return (
        <div>
            <UploadContainer
                uploadType={FileUploadType.PROFILE}
                // uncomment lines for different file types.
                // uploadType={FileUploadType.DOCUMENTS}
            ></UploadContainer>
        </div>
    );
};
