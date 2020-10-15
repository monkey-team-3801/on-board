import React from "react";
import { ProfilePictureContainer } from "./ProfilePictureContainer";

type Props = {
    userID: string;
};

export const ProfilePage: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <div>
            <ProfilePictureContainer
                userId={props.userID}
            ></ProfilePictureContainer>
        </div>
    );
};
