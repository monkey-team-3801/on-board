import React from "react";
import { UserData } from "../../../types";
import { Loader, ProfilePicture } from "../../components";
import { useFetch } from "../../hooks";
import { requestIsLoaded, userTypeToClass } from "../../utils";
import { PeerContext } from "../../peer";
import { MyVideo, RemotePeerVideo } from "../../videostreaming";

type Props = {
    hostId?: string;
    myUserId: string;
};

export const HostDisplay: React.FunctionComponent<Props> = (props: Props) => {
    const {
        peer: myPeer,
        stream: myStream,
        userIdToPeerIdMap,
    } = React.useContext(PeerContext);
    const [userResponse] = useFetch<UserData, { userID?: string }>(
        "/user/getUserById",
        { userID: props.hostId }
    );

    if (!requestIsLoaded(userResponse)) {
        return <Loader />;
    }

    const peerId = props.hostId && userIdToPeerIdMap.get(props.hostId);

    return (
        <div className="presenter-container text-center">
            <div className="presenter-picture peach-gradient d-flex align-items-center">
                {myPeer && myStream ? (
                    <>
                        {props.myUserId === props.hostId ? (
                            <MyVideo muted />
                        ) : (
                            <>{peerId && <RemotePeerVideo peerId={peerId} />}</>
                        )}
                        {}
                    </>
                ) : (
                    props.hostId && (
                        <ProfilePicture
                            userId={props.hostId}
                            openChatOnClick={props.myUserId !== props.hostId}
                        />
                    )
                )}
            </div>
            <h1 className="mt-4">{userResponse.data.username}</h1>
            <p className="text-muted text-capitalize">
                Course {userTypeToClass(userResponse.data.userType)}
            </p>
        </div>
    );
};
