import React from "react";
import { FileUploadType } from "../../../types";
import { UploadContainer } from "../../filehandler/UploadContainer";
import { ProfilePictureContainer } from "../ProfilePictureContainer";
import "./Settings.less";

type Props = {
    userID: string;
    username: string;
};

export const AvatarSettings: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <div className="avatar-settings">
            <ProfilePictureContainer userId={props.userID} />
            <UploadContainer {...props} uploadType={FileUploadType.PROFILE} />
            <h4>Avatar</h4>
        </div>
    );
};
