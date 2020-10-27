import { useCallback, useState, useEffect } from "react";

// Default video contraints.
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

// Enables the audio of a stream.
const streamSetAudioEnabled = (
    enabled: boolean
): ((stream: MediaStream) => void) => {
    return (stream: MediaStream) => {
        stream.getAudioTracks().forEach((track) => {
            track.enabled = enabled;
        });
    };
};

// Disabled the audio of a stream.
export const turnAudioOff: (
    stream: MediaStream
) => void = streamSetAudioEnabled(false);
export const turnAudioOn: (stream: MediaStream) => void = streamSetAudioEnabled(
    true
);

// Sets the stream video to be enabled or disabled.
const streamSetVideoEnabled = (
    enabled: boolean
): ((stream: MediaStream) => void) => {
    return (stream: MediaStream) => {
        stream.getVideoTracks().forEach((track) => {
            track.enabled = enabled;
        });
    };
};

// Disables video of a particular stream.
export const turnVideoOff: (
    stream: MediaStream
) => void = streamSetVideoEnabled(false);
export const turnVideoOn: (stream: MediaStream) => void = streamSetVideoEnabled(
    true
);

// Custom hook for handling the media stream.
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return [stream, enableMediaStream, disableMediaStream];
};
