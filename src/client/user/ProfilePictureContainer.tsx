import React from "react";

type Props = {
    userId: string;
};

export const ProfilePictureContainer = (props: Props) => {
    return (
        <div>
            <img
                src={`/filehandler/getPfp/${props.userId}`}
                alt="profile"
                className="pfp"
            ></img>
        </div>
    );
};
