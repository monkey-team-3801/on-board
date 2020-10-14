import React from "react";
import { Alert, Modal } from "react-bootstrap";
import { useDynamicFetch } from "../hooks";
import { CreatePrivateRoomForm } from "../rooms/components";
import { CourseOptionType } from "../types";
import { requestHasError, requestIsLoaded, requestIsLoading } from "../utils";

type Props = {
    roomSelection?: {
        id?: string;
        name: string;
        description: string;
        courseCode?: string;
    };
    courses: Array<string>;
    onClose: () => void;
    refresh: () => void;
};

export const EditPrivateRoomModal: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [editRoomResponse, editRoom] = useDynamicFetch<
        undefined,
        { id?: string; name: string; description: string; courseCode?: string }
    >("/session/edit/privateSession", undefined, false);

    const [submitting, setSubmitting] = React.useState<boolean>(false);

    const [roomData, setRoomData] = React.useState<
        | {
              id?: string;
              name: string;
              description: string;
              courseCode?: string;
          }
        | undefined
    >();

    const [roomName, setRoomName] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");
    const [selectedCourse, setSelectedCourse] = React.useState<
        CourseOptionType | undefined
    >(undefined);

    const visible = React.useMemo(() => {
        return props.roomSelection !== undefined;
    }, [props.roomSelection]);

    React.useEffect(() => {
        if (visible) {
            setRoomData(props.roomSelection);
            setSubmitting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    React.useEffect(() => {
        if (roomData) {
            setRoomName(roomData.name);
            setDescription(roomData.description);
            setSelectedCourse(
                roomData.courseCode
                    ? {
                          value: roomData.courseCode,
                          label: roomData.courseCode,
                      }
                    : undefined
            );
        }
    }, [roomData]);

    React.useEffect(() => {
        if (requestHasError(editRoomResponse)) {
            setSubmitting(false);
        } else if (requestIsLoaded(editRoomResponse) && submitting) {
            props.refresh();
            setTimeout(() => {
                props.onClose();
            }, 1000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editRoomResponse, submitting]);

    return (
        <Modal
            show={visible}
            onHide={() => {
                props.onClose();
            }}
            size="xl"
            scrollable={true}
            centered={true}
        >
            <Modal.Header closeButton>
                <h1>Edit Room {roomData?.name}</h1>
            </Modal.Header>
            <Modal.Body>
                {
                    <CreatePrivateRoomForm
                        id={roomData?.id}
                        roomName={roomName}
                        description={description}
                        courseCodes={props.courses.map((code) => {
                            return { value: code, label: code };
                        })}
                        selectedCourse={selectedCourse}
                        setRoomName={setRoomName}
                        setDescription={setDescription}
                        setSelectedCourse={setSelectedCourse}
                        requestIsLoading={requestIsLoading(editRoomResponse)}
                        submitting={submitting}
                        onSubmit={async (data) => {
                            setSubmitting(true);
                            if (data.id) {
                                await editRoom(data);
                            }
                        }}
                        submitText={"Edit Room"}
                    />
                }
                {requestIsLoaded(editRoomResponse) && submitting && (
                    <Alert variant="success">Successfully edited room</Alert>
                )}
                {requestHasError(editRoomResponse) && (
                    <Alert variant="danger">{editRoomResponse.message}</Alert>
                )}
            </Modal.Body>
        </Modal>
    );
};
