import React from "react";
import { UserData } from "../types";
import { ProfilePicture } from "../../components";
import { userTypeToClass } from "../../utils";

type Props = Omit<UserData, "allocated"> & {
    children?: React.ReactNode;
};

export const UserDisplay: React.FunctionComponent<Props> = (props: Props) => {
    const { userType, id, username } = props;

    const additionalClass = React.useMemo(() => {
        return userTypeToClass(userType);
    }, [userType]);

    return (
        <div className="user-display">
            <ProfilePicture userId={id} className={additionalClass} />
            <div className="username">
                <p className="text-truncate">{username}</p>
            </div>
            {props.children}
        </div>
    );
};
