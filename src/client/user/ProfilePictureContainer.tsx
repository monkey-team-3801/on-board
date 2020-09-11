import React, { useEffect } from "react";
import { useDynamicFetch } from "../hooks";

type Props = {
    userId: string;
};

export const ProfilePictureContainer = (props: Props) => {
    // const [imageData, getPfp] = useDynamicFetch<string, undefined>(
    //     "filehandler/getPfp",
    //     undefined,
    //     true
    // );

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
