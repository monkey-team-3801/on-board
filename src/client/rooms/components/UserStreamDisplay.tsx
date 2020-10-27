import React from "react";
import { userTypeToClass } from "../../utils";
import { RemotePeerVideo } from "../../videostreaming";
import { UserData } from "../types";

type Props = Omit<UserData, "allocated"> & {
    // Additional children to forward.
    children?: React.ReactNode;
    // The peerid of the user for streaming.
    theirPeerId: string;
};

/**
 * Component to display the stream of a user which has webcam enabled.
 */
export const UserStreamDisplay: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userType, username, theirPeerId } = props;

    const additionalClass = React.useMemo(() => {
        return userTypeToClass(userType);
    }, [userType]);

    return (
        <div className="user-display">
            <RemotePeerVideo peerId={theirPeerId} className={additionalClass} />
            <div className="username">
                <p className="text-truncate">{username}</p>
            </div>
            {props.children}
        </div>
    );
};
