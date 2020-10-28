import React from "react";
import { UserData } from "../types";
import { ProfilePicture } from "../../components";
import { userTypeToClass } from "../../utils";

type Props = Omit<UserData, "allocated"> & {
    // Additional children to forward.
    children?: React.ReactNode;
    // Text colour.
    darkText?: boolean;
};

/**
 * Component for displaying a single user in a breakout room allocation component.
 */
export const UserDisplay: React.FunctionComponent<Props> = (props: Props) => {
    const { userType, id, username } = props;

    const additionalClass = React.useMemo(() => {
        return userTypeToClass(userType);
    }, [userType]);

    return (
        <div className="user-display">
            <ProfilePicture userId={id} className={additionalClass} />
            <div className="username">
                <p
                    className={`text-truncate ${
                        props.darkText ? "text-dark" : ""
                    }`}
                >
                    {username}
                </p>
            </div>
            {props.children}
        </div>
    );
};
