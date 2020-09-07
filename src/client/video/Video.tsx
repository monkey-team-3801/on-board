import React, { useEffect, useRef } from "react";

type Props = {
    videoRef: React.RefObject<HTMLVideoElement>;
    mine: boolean;
};

export const Video: React.FunctionComponent<Props> = ({ mine, videoRef }) => {
    return <video id={mine ? "my-video" : "peers-video"} ref={videoRef} />;
};
