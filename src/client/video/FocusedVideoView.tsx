import React, { useCallback, useEffect, useState } from "react";
import { MediaConnection } from "peerjs";

import { Video } from "./Video";
import { VideoEvent } from "../../events";
import { socket } from "../io";
import { Container, Row, Col } from "react-bootstrap";
import { useFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import "./VideoContainer.less";
import { VideoPeersResponseType, UserPeer } from "../../types";
import {
    addPeer,
    enableMyPeer,
    myPeer,
    peerStreams,
    removePeer
} from "../peer";
import { RemotePeerVideo } from "./RemotePeerVideo";
import { myStream } from "../peer/peer";
import { useMyPeer } from "../hooks/useMyPeer";

type Props = { sessionId: string; userId: string };
type PeerCalls = {
    [key: string]: MediaConnection;
};
type PeerStreams = {
    [key: string]: MediaStream;
};
type VideoStreamData = {
    userId: string;
    stream: MediaStream;
};

export const FocusedVideoView: React.FunctionComponent<Props> = (props) => {
    const { sessionId, userId } = props;
    const [myPeerId, setMyPeerId] = useState<string>("");
    const [peers, setPeers] = useState<Array<string>>([]);
    // const [myStream, setMediaStream] = useMediaStream();
    useEffect(() => {
        enableMyPeer(setMyPeerId);
    }, [setMyPeerId]);
    const [response] = useFetch<
        VideoPeersResponseType,
        { sessionId: string; userId: string }
    >("/videos/peers", { sessionId, userId });
    // myStream?.getTracks().forEach(track => {
    //     console.log(track, track.getCapabilities());
    // });
    myStream?.getVideoTracks().forEach((track) => {
        console.log("video track settings:", track.getSettings());
    });

    useEffect(() => {
        if (requestIsLoaded(response)) {
            setPeers(response.data.peers.map(usePeer => usePeer.peerId));
        }
    }, [response, myPeerId]);

    useEffect(() => {
        if (myPeerId) {
            socket.connect();
            socket.emit(VideoEvent.USER_JOIN_ROOM, {
                sessionId,
                userId,
                peerId: myPeerId,
            });
        }
        return () => {
            // socket.emit(VideoEvent.USER_LEAVE_ROOM, {
            //     sessionId,
            //     userId,
            //     peerId: myPeerId,
            // });
        };
    }, [myPeerId, sessionId, userId]);

    useEffect(() => {
        return () => {
            console.log("cleanup");
            socket.disconnect();
            //disableMyPeer();
        };
    }, []);

    const onSocketUpdateUsers = useCallback(async (userPeer: UserPeer) => {
        console.log("new peer", userPeer.peerId);
        await addPeer(userPeer.peerId);
    }, []);

    const onSocketRemoveUser = useCallback((userPeer: UserPeer) => {
        removePeer(userPeer.peerId);
    }, []);

    // Handle socket interactions
    useEffect(() => {
        // Listen to update event
        socket.on(VideoEvent.USER_JOIN_ROOM, onSocketUpdateUsers);
        socket.on(VideoEvent.USER_LEAVE_ROOM, onSocketRemoveUser);

        // console.log("Use effect running, emitting join room");
        // socket.emit(VideoEvent.USER_JOIN_ROOM, { sessionId, userId: myPeerId });
        return () => {
            socket.off(VideoEvent.USER_JOIN_ROOM, onSocketUpdateUsers);
            socket.off(VideoEvent.USER_LEAVE_ROOM, onSocketRemoveUser);
        };
    }, [onSocketUpdateUsers, onSocketRemoveUser]);

    // Receive calls
    return (
        <Container fluid className="video-container">
            <Row>
                <Col lg={4}>
                    <p>You</p>
                    {myStream ? "Stream exists" : "Stream not exists"}
                    {myStream && myPeer && (
                        <Video
                            videoStream={myStream}
                            mine={true}
                            muted={true}
                        />
                    )}
                </Col>
                {Array.from(peerStreams.entries()).map(
                    ([peerId, stream], i) => {
                        return (
                            <Col lg={4} key={i}>
                                <p>{peerId}</p>
                                <RemotePeerVideo peerId={peerId} myPeerId={myPeerId}/>
                            </Col>
                        );
                    }
                )}
            </Row>
        </Container>
    );
};
