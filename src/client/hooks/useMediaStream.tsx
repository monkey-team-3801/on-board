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
                    const stream = await navigator.mediaDevices.getUserMedia(
                        constraints
                    );
                    setStream(stream);

                } catch (e) {
                    setStream(undefined);
                }
            }
        },
        []
    );

    const disableMediaStream = useCallback(() => {
        stream?.getTracks().forEach((track) => {
            track.stop();
            // track.enabled = false;
            stream?.removeTrack(track);
        });

        console.log("Turning off stream", stream);
        console.log("Turning off stream tracks", stream?.getTracks());
        //setStream(undefined);
    }, [stream]);

    useEffect(() => {
        enableMediaStream();
        return () => {
            disableMediaStream();
        };
    }, [enableMediaStream]);
    return [stream, enableMediaStream, disableMediaStream];
};
