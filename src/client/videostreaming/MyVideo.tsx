import React, { useContext } from "react";
import { PeerContext } from "../peer";
import { StreamVideo } from "./StreamVideo";

type Props = {
    muted: boolean;
};

export const MyVideo: React.FunctionComponent<Props> = ({ muted }) => {
    // My stream
    const { stream: myStream } = useContext(PeerContext);
    return <StreamVideo muted={muted} stream={myStream} />;
};
