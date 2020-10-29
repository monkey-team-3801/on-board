import React from "react";
import RecordRTC, { MediaStreamRecorder } from "recordrtc";

export const useScreenRecording: () => [() => Promise<void>, () => void] = (
    sessionName?: string
) => {
    const [screenStream, setScreenStream] = React.useState<
        MediaStream | undefined
    >();
    const recordRef = React.useRef<RecordRTC | undefined>();

    const beginRecording = React.useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });
            setScreenStream(stream);
        } catch (e) {
            return;
        }
    }, []);

    React.useEffect(() => {
        const record = recordRef;
        if (screenStream) {
            record.current = new RecordRTC(screenStream, {
                mimeType: "video/mp4",
                type: "video",
                recorderType: MediaStreamRecorder,
            });
            record.current.startRecording();
        } else {
            if (record.current) {
                record.current.stopRecording(() => {
                    record.current?.save(
                        `${
                            sessionName ? sessionName : ""
                        }${new Date().toDateString()}`
                    );
                    record.current?.destroy();
                    record.current = undefined;
                });
            }
        }
    }, [screenStream, sessionName]);

    const stopAndSaveRecording = React.useCallback(() => {
        setScreenStream(undefined);
    }, []);

    return [beginRecording, stopAndSaveRecording];
};
