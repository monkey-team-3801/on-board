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
        echoCancellation: true
    }
};
type MediaType = "camera" | "display" | "none";

export const useMediaStream: () => [
    MediaStream | undefined,
    (type: MediaType, constraints?: MediaStreamConstraints) => Promise<void>
] = () => {
    const [stream, setStream] = useState<MediaStream | undefined>(undefined);
    const setMediaStream = useCallback(
        async (
            type: MediaType,
            constraints: MediaStreamConstraints = defaultConstraints
        ) => {
            try {
                if (type === "camera") {
                    const stream = await navigator.mediaDevices.getUserMedia(
                        constraints
                    );
                    setStream(stream);
                } else if (type === "display") {
                    const stream = await navigator.mediaDevices.getDisplayMedia(
                        constraints
                    );
                    setStream(stream);
                } else {
                    setStream(undefined);
                }
            } catch (e) {
                setStream(undefined);
            }
        },
        []
    );

    useEffect(() => {
        setMediaStream("camera");
        return () => {
            setMediaStream("none");
        };
    }, [setMediaStream]);
    return [stream, setMediaStream];
};
