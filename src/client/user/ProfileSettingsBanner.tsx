import React from "react";
import { ProfilePictureContainer } from "./ProfilePictureContainer";

type Props = {
    userID: string;
    username: string;
};

export const ProfileSettingsBanner: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <div>
            <ProfilePictureContainer userId={props.userID} />
            <h1>{props.username}</h1>
        </div>
    );
};
