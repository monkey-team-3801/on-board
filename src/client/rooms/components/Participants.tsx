import React, { useContext } from "react";
import { Row } from "react-bootstrap";
import { GiHand } from "react-icons/gi";
import { UserDataResponseType } from "../../../types";
import { PeerContext } from "../../peer";
import { UserDisplay } from "../components";
import { SelfStreamDisplay } from "./SelfStreamDisplay";
import { UserStreamDisplay } from "./UserStreamDisplay";

type Props = {
    users: Array<Omit<UserDataResponseType, "courses">>;
    raisedHandUsers: Array<string>;
    myUserId: string;
};

export const Participants: React.FunctionComponent<Props> = (props: Props) => {
    const { raisedHandUsers } = props;
    const { peer: myPeer, stream: myStream, userIdToPeerIdMap } = useContext(
        PeerContext
    );

    const handIcon = React.useCallback(
        (user: { id: string }) => {
            return raisedHandUsers.includes(user.id) ? (
                <GiHand className="hand" />
            ) : (
                <></>
            );
        },
        [raisedHandUsers]
    );

    return (
        <Row className="mt-2">
            <div className="user-display-container">
                {props.users.map((user) => {
                    if (user.id === props.myUserId) {
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
                })}
            </div>
        </Row>
    );
};
