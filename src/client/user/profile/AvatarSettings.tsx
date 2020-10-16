import React from "react";
import { FileUploadType } from "../../../types";
import { UploadContainer } from "../../filehandler/UploadContainer";
import { ProfilePictureContainer } from "../ProfilePictureContainer";
import { MdEdit } from "react-icons/md";
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
            <h6 className="mt-2">Profile Picture</h6>
            <ProfilePictureContainer userId={props.userID} />
            <UploadContainer {...props} uploadType={FileUploadType.PROFILE} />
            <div>
                <MdEdit className="editIcon" size={42} color={"white"} />
            </div>
        </div>
    );
};
