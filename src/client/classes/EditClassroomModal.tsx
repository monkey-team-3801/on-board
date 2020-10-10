import React from "react";
import { Alert, Modal } from "react-bootstrap";
import {
    ClassroomSessionData,
    RoomType,
    UserEnrolledCoursesResponseType,
} from "../../types";
import { useDynamicFetch, useFetch } from "../hooks";
import { ScheduleRoomForm } from "../rooms/components";
import { CourseOptionType } from "../types";
import {
    baseRoomTypeOptions,
    requestHasError,
    requestIsLoaded,
    requestIsLoading,
} from "../utils";

type Props = {
    roomSelection:
        | {
              data: Omit<ClassroomSessionData, "messages">;
              type: RoomType;
              message?: string;
          }
        | undefined;
    onClose: () => void;
    refresh: () => void;
};

export const EditClassroomModal: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [editRoomResponse, editRoom] = useDynamicFetch<
        undefined,
        { data: Omit<ClassroomSessionData, "messages">; type: RoomType }
    >("/session/edit/classroomSession", undefined, false);

    const [courseData] = useFetch<UserEnrolledCoursesResponseType>(
        "/user/courses"
    );

    const [submitting, setSubmitting] = React.useState<boolean>(false);

    const [roomData, setRoomData] = React.useState<
        Omit<ClassroomSessionData, "messages"> | undefined
    >();

    const [roomName, setRoomName] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");
    const [courseCodes, setCourseCodes] = React.useState<
        Array<CourseOptionType>
    >([]);
    const [selectedCourse, setSelectedCourse] = React.useState<
        CourseOptionType | undefined
    >(undefined);
    const [roomType, setRoomType] = React.useState<CourseOptionType>(
        baseRoomTypeOptions[0]!
    );
    const [startingTime, setStartingTime] = React.useState<Date>(new Date());

    const [endingTime, setEndingTime] = React.useState<Date>(
        new Date(new Date().getTime() + 3600000)
    );

    const [colourCode, setColourCode] = React.useState<string>("#5c4e8e");

    const visible = React.useMemo(() => {
        return props.roomSelection !== undefined;
    }, [props.roomSelection]);

    React.useEffect(() => {
        if (visible) {
            setRoomData(props.roomSelection?.data);
            setSubmitting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    React.useEffect(() => {
        if (roomData && courseData.data) {
            setRoomName(roomData.name);
            setDescription(roomData.description);
            setCourseCodes(
                courseData.data.courses.map((code) => {
                    return { value: code, label: code };
                })
            );
            setSelectedCourse({
                value: roomData.courseCode,
                label: roomData.courseCode,
            });
            setRoomType({ value: roomData.roomType, label: roomData.roomType });
            setStartingTime(new Date(roomData.startTime));
            setEndingTime(new Date(roomData.endTime));
            setColourCode(roomData.colourCode);
        }
    }, [roomData, courseData]);

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
                    <ScheduleRoomForm
                        id={props.roomSelection?.data.id}
                        roomName={roomName}
                        description={description}
                        courseCodes={courseCodes}
                        selectedCourse={selectedCourse}
                        roomType={roomType}
                        startingTime={startingTime}
                        endingTime={endingTime}
                        colourCode={colourCode}
                        setRoomName={setRoomName}
                        setDescription={setDescription}
                        setCourseCodes={setCourseCodes}
                        setSelectedCourse={setSelectedCourse}
                        setRoomType={setRoomType}
                        setStartingTime={setStartingTime}
                        setEndingTime={setEndingTime}
                        setColourCode={setColourCode}
                        requestIsLoading={requestIsLoading(editRoomResponse)}
                        submitting={submitting}
                        onSubmit={async (
                            data: Omit<
                                ClassroomSessionData,
                                "messages" | "id"
                            > & { id?: string }
                        ) => {
                            if (data.id) {
                                await editRoom({
                                    data: {
                                        ...data,
                                        id: data.id,
                                    },
                                    type: props.roomSelection!.type,
                                });
                                setSubmitting(true);
                            }
                        }}
                        submitText={"Edit Room"}
                    />
                }
                {requestIsLoaded(editRoomResponse) && submitting && (
                    <Alert variant="success">Successfully edited room</Alert>
                )}
                {new Date().getTime() > startingTime.getTime() && (
                    <Alert variant="info">
                        This class will open immediately
                    </Alert>
                )}
                {requestHasError(editRoomResponse) && (
                    <Alert variant="danger">{editRoomResponse.message}</Alert>
                )}
            </Modal.Body>
        </Modal>
    );
};
