import React from "react";
import { ProfilePictureContainer } from "../ProfilePictureContainer";

type Props = {
    userID: string;
    username: string;
};

export const AvatarSettings: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <div id="banner">
            <h2>Avatar</h2>
            <ProfilePictureContainer userId={props.userID} />
            <h3>{props.username}</h3>
        </div>
    );
};
