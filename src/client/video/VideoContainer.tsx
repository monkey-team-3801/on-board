import React, { useState } from "react";
import Peer from "peerjs";
import { Video } from "./Video";
import { useMyPeer } from "../hooks/useMyPeer";

type Props = {
    roomId: string;
    username: string;
};

type Peers = Map<string, Peer.MediaConnection>;

export const VideoContainer: React.FunctionComponent<Props> = ({
    roomId,
    username,
}) => {
    // TODO: host our own peer server?
    const [myPeer, myRef] = useMyPeer();
    const [peers, setPeers] = useState<Peers>(() => new Map());
    return <Video videoRef={myRef} mine={true} />;
};
