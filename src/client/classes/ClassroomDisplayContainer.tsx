import React from "react";
import { Button, Col, Container, Row, Form } from "react-bootstrap";
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
import Select from "react-select";
import { isArray } from "lodash";

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

    const [roomFilterValue, setRoomFilterValue] = React.useState<string>("");
    const [roomActiveFilter, setRoomActiveFilter] = React.useState<string>("");

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

    const filteredClassrooms = React.useMemo(() => {
        if (roomActiveFilter === "Active" || !roomActiveFilter) {
            return classroomsResponse.data?.filter((session) => {
                return session.name
                    .toLocaleLowerCase()
                    .includes(roomFilterValue.toLocaleLowerCase());
            });
        }
    }, [roomFilterValue, roomActiveFilter, classroomsResponse]);

    const filteredUpcomingRooms = React.useMemo(() => {
        if (roomActiveFilter === "Upcoming" || !roomActiveFilter) {
            return upcomingClassroomsResponse.data?.filter((session) => {
                return session.name.includes(roomFilterValue);
            });
        }
    }, [roomFilterValue, roomActiveFilter, upcomingClassroomsResponse]);

    return (
        <Container fluid className="pt-2">
            <Row>
                <Col xl={6}>
                    <Form.Control
                        type="text"
                        placeholder="Search rooms..."
                        onChange={(e) => {
                            setRoomFilterValue(e.target.value);
                        }}
                    />
                </Col>
                <Col xl={6}>
                    <Select
                        placeholder="Filter active..."
                        options={[
                            { value: "Active", label: "Active" },
                            { value: "Upcoming", label: "Upcoming" },
                        ]}
                        isClearable
                        onChange={(value) => {
                            setRoomActiveFilter(
                                ((value as unknown) as { value: string } | null)
                                    ?.value ?? ""
                            );
                        }}
                    />
                </Col>
            </Row>
            {filteredClassrooms &&
                filteredClassrooms.map((session, i) => {
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
            {filteredUpcomingRooms &&
                filteredUpcomingRooms.map((session, i) => {
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
