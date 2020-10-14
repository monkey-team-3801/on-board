import { useCallback, useState, useEffect } from "react";

declare global {
    interface MediaDevices {
        getDisplayMedia: (
            constraints?: MediaStreamConstraints
        ) => Promise<MediaStream>;
    }
}
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
type MediaType = "camera" | "display" | "none";

const streamSetEnabled = (
    enabled: boolean
): ((stream: MediaStream) => void) => {
    return (stream: MediaStream) => {
        stream.getTracks().forEach((track) => {
            track.enabled = enabled;
        });
    };
};

export const pauseStream: (stream: MediaStream) => void = streamSetEnabled(
    false
);
export const resumeStream: (stream: MediaStream) => void = streamSetEnabled(
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
