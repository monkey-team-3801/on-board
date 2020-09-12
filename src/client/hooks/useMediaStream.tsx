import { useEffect, useState } from "react";

export const useMediaStream: () => [MediaStream | null] = () => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: false,
            })
            .then((stream) => {
                setStream(stream);
            });
    }, []);
    return [stream];
};
