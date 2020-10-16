import React from "react";
import { UserData } from "../types";
import { UserType } from "../../../types";
import { ProfilePicture } from "../../components";

type Props = Omit<UserData, "allocated"> & {
    children?: React.ReactNode;
};

const userTypeToClass = (userType: UserType) => {
    switch (userType) {
        case UserType.STUDENT:
            return "student";
        case UserType.TUTOR:
            return "tutor";
        case UserType.COORDINATOR:
            return "coordinator";
    }
};

export const UserDisplay: React.FunctionComponent<Props> = (props: Props) => {
    const { userType, id, username } = props;

    const additionalClass = React.useMemo(() => {
        return userTypeToClass(userType);
    }, [userType]);

    return (
        <div className="user-display">
            <ProfilePicture userId={id} classNames={additionalClass} />
            <div className="username">
                <p className="text-truncate">{username}</p>
            </div>
            {props.children}
        </div>
    );
};
