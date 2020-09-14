import { useEffect, useState } from "react";

export const useMediaStream: () => [MediaStream | undefined] = () => {
    const [stream, setStream] = useState<MediaStream | undefined>(undefined);
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
