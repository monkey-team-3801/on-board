import React from "react";
import { userTypeToClass } from "../../utils";
import { MyVideo } from "../../videostreaming";
import { UserData } from "../types";

type Props = Omit<UserData, "allocated"> & {
    children?: React.ReactNode;
};

export const SelfStreamDisplay: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userType, username } = props;

    const additionalClass = React.useMemo(() => {
        return userTypeToClass(userType);
    }, [userType]);

    return (
        <div className="user-display">
            <MyVideo muted className={additionalClass} />
            <div className="username">
                <p className="text-truncate">{username}</p>
            </div>
            {props.children}
        </div>
    );
};
