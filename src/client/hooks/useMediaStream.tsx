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

export const turnAudioOff: (
    stream: MediaStream
) => void = streamSetAudioEnabled(false);
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

export const turnVideoOff: (
    stream: MediaStream
) => void = streamSetVideoEnabled(false);
export const turnVideoOn: (stream: MediaStream) => void = streamSetVideoEnabled(
    true
);

export const useMediaStream: () => [
    MediaStream,
    (constraints?: MediaStreamConstraints) => Promise<void>,
    () => void,
    boolean
] = () => {
    const emptyAudioTrack = useCallback<() => MediaStreamTrack>(() => {
        let ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const dest = ctx.createMediaStreamDestination();
        oscillator.connect(dest);
        oscillator.start();
        return Object.assign(dest.stream.getAudioTracks()[0], {enabled: false});
    }, []);

    const emptyVideoTrack = useCallback<(width: number, height: number) => MediaStreamTrack>((width: number, height: number) => {
        let canvas: HTMLCanvasElement = Object.assign(document.createElement("canvas"), {width, height});
        canvas.getContext("2d")?.fillRect(0, 0, width, height);
        let stream = canvas.captureStream(30);
        return Object.assign(stream.getVideoTracks()[0], {enabled: false});
    }, []);

    let blackSilence = useCallback<(width: number, height: number) => MediaStream>((width: number, height: number) => new MediaStream([emptyVideoTrack(width, height), emptyAudioTrack()]), []);
    const [stream, setStream] = useState<MediaStream>(() => blackSilence(480, 360));
    const [streamEnabled, setStreamEnabled] = useState<boolean>(false);
    const enableMediaStream = useCallback(
        async (constraints: MediaStreamConstraints = defaultConstraints) => {
            if (!streamEnabled) {
                try {
                    const newStream = await navigator.mediaDevices.getUserMedia(
                        constraints
                    );
                    setStream(newStream);
                    setStreamEnabled(true);
                } catch (e) {
                    console.log("error setting stream", e);
                }
            } else {
                stream.getTracks().forEach((track) => {
                    track.enabled = true;
                });
            }
        },
        [stream, streamEnabled]
    );

    const disableMediaStream = useCallback(() => {
        stream.getTracks().forEach((track) => {
            track.stop();
            stream.removeTrack(track);
        });
        setStreamEnabled(false);
        console.log("Turning off stream", stream);
    }, [stream]);

    useEffect(() => {
        enableMediaStream();
        return () => {
            disableMediaStream();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return [stream, enableMediaStream, disableMediaStream, streamEnabled];
};
