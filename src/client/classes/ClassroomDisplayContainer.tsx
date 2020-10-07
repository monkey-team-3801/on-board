import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import {
    ClassroomSessionData,
    RoomType,
    SessionDeleteRequestType,
} from "../../types";
import { useDynamicFetch, useFetch } from "../hooks";
import { UserData } from "../rooms/types";
import { requestIsLoaded, requestIsLoading } from "../utils";
import { EditClassroomModal } from "./EditClassroomModal";
import { ClassContainer } from "./ClassContainer";

type Props = RouteComponentProps & {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    userData: UserData;
};

export const ClassroomDisplayContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading, history } = props;

    const [roomSelection, setRoomSelection] = React.useState<
        | { data: Omit<ClassroomSessionData, "messages">; type: RoomType }
        | undefined
    >();

    const [classroomsResponse, getClassrooms] = useFetch<
        Array<ClassroomSessionData>
    >("session/classroomSessions");

    const [upcomingClassroomsResponse, getUpcomingClassrooms] = useFetch<
        Array<Omit<ClassroomSessionData, "messages">>
    >("session/upcomingClassroomSessions");

    const [deleteRoomResponse, deleteRoom] = useDynamicFetch<
        undefined,
        SessionDeleteRequestType
    >("session/delete/classroom", undefined, false);

    const onRoomJoinClick = React.useCallback(
        (id: string) => {
            history.push(`/classroom/${id}`);
        },
        [history]
    );

    React.useEffect(() => {
        if (requestIsLoaded(classroomsResponse)) {
            setLoading(false);
        }
    }, [classroomsResponse, setLoading]);

    return (
        <Container fluid>
            {classroomsResponse.data &&
                classroomsResponse.data.map((session, i) => {
                    return (
                        <ClassContainer
                            {...session}
                            key={session.id}
                            canEdit={props.userData.id === session.createdBy}
                            canJoin
                            onJoinClick={() => {
                                onRoomJoinClick(session.id);
                            }}
                            onEditClick={() => {
                                setRoomSelection({
                                    data: session,
                                    type: RoomType.CLASS,
                                });
                            }}
                            onDeleteClick={async () => {
                                await deleteRoom({
                                    id: session.id,
                                });
                                await getClassrooms();
                            }}
                            isDeleting={
                                requestIsLoading(deleteRoomResponse) ||
                                requestIsLoading(classroomsResponse)
                            }
                            size="lg"
                        />
                    );
                })}
            {upcomingClassroomsResponse.data &&
                upcomingClassroomsResponse.data.map((session, i) => {
                    return (
                        <ClassContainer
                            {...session}
                            key={session.id}
                            canEdit={props.userData.id === session.createdBy}
                            onEditClick={() => {
                                setRoomSelection({
                                    data: session,
                                    type: RoomType.UPCOMING,
                                });
                            }}
                            onDeleteClick={async () => {
                                await deleteRoom({
                                    id: session.id,
                                });
                                await getClassrooms();
                            }}
                            isDeleting={
                                requestIsLoading(deleteRoomResponse) ||
                                requestIsLoading(upcomingClassroomsResponse)
                            }
                            size="lg"
                        />
                    );
                })}
            <EditClassroomModal
                roomSelection={roomSelection}
                onClose={() => {
                    setRoomSelection(undefined);
                }}
                refresh={() => {
                    getClassrooms();
                    getUpcomingClassrooms();
                }}
            />
        </Container>
    );
};
