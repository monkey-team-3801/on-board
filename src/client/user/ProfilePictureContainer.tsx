import React from "react";
import "./ProfilePictureContainer.less";

type Props = {
    userId: string;
};

export const ProfilePictureContainer = (props: Props) => {
    return (
        <div>
            <img
                src={`/filehandler/getPfp/${props.userId}`}
                alt="user profile"
                className="pfpContainer"
            ></img>
        </div>
    );
};
