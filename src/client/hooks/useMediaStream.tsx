import { useCallback, useState } from "react";

export const useMediaStream: () => [
    MediaStream | undefined,
    () => void,
    () => void
] = () => {
    const [stream, setStream] = useState<MediaStream | undefined>(undefined);
    const getMediaStream = useCallback(() => {
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: false,
            })
            .then((stream) => {
                setStream(stream);
            });
    }, []);
    const clearMediaStream = useCallback(() => {
        setStream(undefined);
    }, []);
    return [stream, getMediaStream, clearMediaStream];
};
