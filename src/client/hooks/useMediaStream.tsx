import { useCallback, useState, useEffect } from "react";

declare global {
    interface MediaDevices {
        getDisplayMedia: (
            constraints?: MediaStreamConstraints
        ) => Promise<MediaStream>;
    }
}

type MediaType = "camera" | "display" | "none";
type MediaOptionsType = {
    video: boolean;
    audio: boolean;
};

export const useMediaStream: () => [
    MediaStream | undefined,
    (type: MediaType, options?: MediaOptionsType) => Promise<void>
] = () => {
    const [stream, setStream] = useState<MediaStream | undefined>(undefined);
    const setMediaStream = useCallback(
        async (
            type: MediaType,
            options: MediaOptionsType = { video: true, audio: false }
        ) => {
            try {
                if (type === "camera") {
                    const stream = await navigator.mediaDevices.getUserMedia(
                        options
                    );
                    setStream(stream);
                } else if (type === "display") {
                    const stream = await navigator.mediaDevices.getDisplayMedia(
                        options
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
