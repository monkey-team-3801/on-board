import React from "react";
import { FileUploadType } from "../../../types";
import { UploadContainer } from "../../filehandler/UploadContainer";
import { ProfilePicture } from "../../components";
import { MdEdit } from "react-icons/md";
import "./Settings.less";

type Props = {
    // Current user id.
    userID: string;
    // Current user name.
    username: string;
};

/**
 * Component which allows the configuration of a user's profile picture.
 */
export const AvatarSettings: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <div className="avatar-settings">
            <h6 className="mt-2">Profile Picture</h6>
            <ProfilePicture userId={props.userID} />
            <UploadContainer {...props} uploadType={FileUploadType.PROFILE} />
            <div>
                <MdEdit className="editIcon" size={42} color={"white"} />
            </div>
        </div>
    );
};
