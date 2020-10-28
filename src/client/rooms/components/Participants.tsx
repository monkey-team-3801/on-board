import React, { useContext } from "react";
import { Col, Row } from "react-bootstrap";
import { FaHandPaper } from "react-icons/fa";
import { UserDataResponseType } from "../../../types";
import { PeerContext } from "../../peer";
import { UserDisplay } from "../components";
import { SelfStreamDisplay } from "./SelfStreamDisplay";
import { UserStreamDisplay } from "./UserStreamDisplay";

type Props = {
    // Array of users in the session.
    users: Array<Omit<UserDataResponseType, "courses">>;
    // Array of users which have their hands raised.
    raisedHandUsers: Array<string>;
    // Current user id.
    myUserId: string;
    // Large or small user profiles?
    size?: "lg" | "sm";
};

/**
 * Wrapper for user display items.
 */
const UserDisplayWrapper: React.FunctionComponent<
    Omit<Props, "users"> & {
        user: Omit<UserDataResponseType, "courses">;
    }
> = ({ user, myUserId, raisedHandUsers }) => {
    const { peer: myPeer, stream: myStream, userIdToPeerIdMap } = useContext(
        PeerContext
    );

    const handIcon = React.useCallback(
        (user: { id: string }) => {
            return raisedHandUsers.includes(user.id) ? (
                <FaHandPaper className="hand" />
            ) : (
                <></>
            );
        },
        [raisedHandUsers]
    );

    if (user.id === myUserId) {
        if (myPeer && myStream) {
            return (
                <SelfStreamDisplay {...user} key={user.id}>
                    {handIcon(user)}
                </SelfStreamDisplay>
            );
        }
        return (
            <UserDisplay {...user} key={user.id}>
                {handIcon(user)}
            </UserDisplay>
        );
    } else {
        const userPeerId = userIdToPeerIdMap.get(user.id);
        if (userPeerId) {
            return (
                <UserStreamDisplay
                    {...user}
                    theirPeerId={userPeerId}
                    key={user.id}
                >
                    {handIcon(user)}
                </UserStreamDisplay>
            );
        }
        return (
            <UserDisplay {...user} key={user.id}>
                {handIcon(user)}
            </UserDisplay>
        );
    }
};

/**
 * Component for displaying the currently users in a session.
 */
export const Participants: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <Row className="mt-3">
            <div
                className={`user-display-container ${props.size || "sm"} px-2`}
            >
                {props.users.map((user) => {
                    return (
                        <Col md="3">
                            <UserDisplayWrapper user={user} {...props} />
                        </Col>
                    );
                })}
            </div>
        </Row>
    );
};
