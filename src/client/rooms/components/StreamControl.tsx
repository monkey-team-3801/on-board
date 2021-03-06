import React from "react";
import { ButtonGroup, Button } from "react-bootstrap";
import * as BiIcons from "react-icons/bi";
import {
    MdPhonelink,
    MdPhonelinkOff,
    MdFiberSmartRecord,
} from "react-icons/md";
import { PeerContext } from "../../peer";
import {
    turnVideoOff,
    turnAudioOn,
    turnVideoOn,
    turnAudioOff,
} from "../../hooks/useMediaStream";
import { useScreenRecording } from "../../hooks/useScreenRecording";
import { AiOutlineVideoCameraAdd } from "react-icons/ai";

type Props = {
    setupScreenSharing: () => Promise<void>;
    stopScreenSharing: () => void;
    disableStaffControl?: boolean;
    children?: React.ReactNode;
};

/**
 * Component for controlling stream elements such as camera, mic etc.
 */
export const StreamControl: React.FunctionComponent<Props> = (props: Props) => {
    const { setupScreenSharing, stopScreenSharing } = props;
    const { stream } = React.useContext(PeerContext);
    const [beginRecording, stopAndSaveRecording] = useScreenRecording();

    const [cameraEnabled, setCameraEnabled] = React.useState<boolean>(false);
    const [cameraAudioEnabled, setCameraAudioEnabled] = React.useState<boolean>(
        false
    );
    const [screenEnabled, setScreenEnabled] = React.useState<boolean>(false);
    const [isRecording, setIsRecording] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (stream) {
            if (cameraEnabled) {
                turnVideoOn(stream);
            } else {
                turnVideoOff(stream);
            }
        }
    }, [cameraEnabled, stream]);

    React.useEffect(() => {
        if (stream) {
            if (cameraAudioEnabled) {
                turnAudioOn(stream);
            } else {
                turnAudioOff(stream);
            }
        }
    }, [cameraAudioEnabled, stream]);

    return (
        <ButtonGroup className="classroom-btn-grp d-flex mt-4">
            <Button
                className="first-btn"
                disabled={props.disableStaffControl}
                onClick={() => {
                    setCameraEnabled((enabled) => {
                        return !enabled;
                    });
                }}
            >
                {cameraEnabled ? (
                    <BiIcons.BiVideoOff className="setting-icon" />
                ) : (
                    <BiIcons.BiVideo className="setting-icon" />
                )}
                <p className="icon-label">
                    Camera {cameraEnabled ? "off" : "on"}
                </p>
            </Button>
            <Button
                className="setting-btn"
                disabled={props.disableStaffControl}
                onClick={() => {
                    setCameraAudioEnabled((enabled) => {
                        return !enabled;
                    });
                }}
            >
                {cameraAudioEnabled ? (
                    <BiIcons.BiMicrophoneOff className="setting-icon" />
                ) : (
                    <BiIcons.BiMicrophone className="setting-icon" />
                )}
                <p className="icon-label">
                    Mic {cameraAudioEnabled ? "off" : "on"}
                </p>
            </Button>
            <Button
                className="setting-btn"
                disabled={props.disableStaffControl}
                onClick={async () => {
                    if (!screenEnabled) {
                        await setupScreenSharing().catch(() => {
                            setScreenEnabled(false);
                        });
                        setScreenEnabled(true);
                    } else {
                        stopScreenSharing();
                        setScreenEnabled(false);
                    }
                }}
            >
                {screenEnabled ? (
                    <MdPhonelinkOff className="setting-icon" />
                ) : (
                    <MdPhonelink className="setting-icon" />
                )}
                <p className="icon-label">
                    {screenEnabled ? "Stop sharing" : "Share screen"}
                </p>
            </Button>
            <Button
                className={props.children ? "setting-btn" : "end-btn"}
                onClick={async () => {
                    if (!isRecording) {
                        await beginRecording();
                        setIsRecording(true);
                    } else {
                        stopAndSaveRecording();
                        setIsRecording(false);
                    }
                }}
            >
                {isRecording ? (
                    <MdFiberSmartRecord className="setting-icon" />
                ) : (
                    <AiOutlineVideoCameraAdd className="setting-icon" />
                )}
                <p className="icon-label">
                    {isRecording ? "Save recording" : "Start recording"}
                </p>
            </Button>
            {props.children}
        </ButtonGroup>
    );
};
