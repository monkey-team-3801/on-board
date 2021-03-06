import React, { useContext } from "react";
import { PeerContext } from "../peer";
import { StreamVideo } from "./StreamVideo";

type Props = {
    muted: boolean;
    className?: string;
};

/**
 * Component displaying the current user's stream.
 */
export const MyVideo: React.FunctionComponent<Props> = ({
    muted,
    className,
}) => {
    // My stream
    const { stream: myStream } = useContext(PeerContext);
    return (
        <StreamVideo muted={muted} stream={myStream} className={className} />
    );
};
