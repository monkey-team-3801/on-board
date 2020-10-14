import { useCallback, useState, useEffect } from "react";

const defaultConstraints: MediaStreamConstraints = {
    video: {
        width: 480,
        height: 360,
        frameRate: 8,
        aspectRatio: 1.3333333,
    },
    audio: {
        noiseSuppression: true,
        echoCancellation: true,
    },
};


const streamSetAudioEnabled = (
    enabled: boolean
): ((stream: MediaStream) => void) => {
    return (stream: MediaStream) => {
        stream.getAudioTracks().forEach((track) => {
            track.enabled = enabled;
        });
    };
};

export const turnAudioOff: (stream: MediaStream) => void = streamSetAudioEnabled(
    false
);
export const turnAudioOn: (stream: MediaStream) => void = streamSetAudioEnabled(
    true
);

const streamSetVideoEnabled = (
    enabled: boolean
): ((stream: MediaStream) => void) => {
    return (stream: MediaStream) => {
        stream.getVideoTracks().forEach((track) => {
            track.enabled = enabled;
        });
    };
};

export const turnVideoOff: (stream: MediaStream) => void = streamSetVideoEnabled(
    false
);
export const turnVideoOn: (stream: MediaStream) => void = streamSetVideoEnabled(
    true
);

export const useMediaStream: () => [
    MediaStream | undefined,
    (constraints?: MediaStreamConstraints) => Promise<void>,
    () => void
] = () => {
    const [stream, setStream] = useState<MediaStream | undefined>(undefined);
    const enableMediaStream = useCallback(
        async (constraints: MediaStreamConstraints = defaultConstraints) => {
            if (!stream) {
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia(
                        constraints
                    );
                    setStream(newStream);
                } catch (e) {
                    console.log("error setting stream", e);
                    setStream(undefined);
                }
            } else {
                stream.getTracks().forEach((track) => {
                    track.enabled = true;
                });
            }
        },
        [stream]
    );

    const disableMediaStream = useCallback(() => {
        stream?.getTracks().forEach((track) => {
            track.stop();
            stream?.removeTrack(track);
        });

        console.log("Turning off stream", stream);
        console.log("Turning off stream tracks", stream?.getTracks());
        setStream(undefined);
    }, [stream]);

    useEffect(() => {
        enableMediaStream();
        return () => {
            disableMediaStream();
        };
    }, [disableMediaStream, enableMediaStream]);
    return [stream, enableMediaStream, disableMediaStream];
};
