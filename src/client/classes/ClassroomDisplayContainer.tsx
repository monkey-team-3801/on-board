import React from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import Select from "react-select";
import { ClassroomSessionData, RoomType } from "../../types";
import { useFetch } from "../hooks";
import { UserData } from "../rooms/types";
import { requestIsLoaded, requestIsLoading } from "../utils";
import { ClassContainer } from "./ClassContainer";
import { EditClassroomModal } from "./EditClassroomModal";

type Props = RouteComponentProps & {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    userData: UserData;
    courses: Array<string>;
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
    const [courseFilter, setCourseFilter] = React.useState<string>("");

    const [classroomsResponse, getClassrooms] = useFetch<
        Array<ClassroomSessionData>
    >("session/classroomSessions");

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
                return (
                    session.name
                        .toLocaleLowerCase()
                        .includes(roomFilterValue.toLocaleLowerCase()) &&
                    (courseFilter === "" || session.courseCode === courseFilter)
                );
            });
        }
    }, [roomFilterValue, roomActiveFilter, classroomsResponse, courseFilter]);

    // const filteredUpcomingRooms = React.useMemo(() => {
    //     if (roomActiveFilter === "Upcoming" || !roomActiveFilter) {
    //         return sortedClassrooms?.filter((session) => {
    //             return (
    //                 session.name.includes(roomFilterValue) &&
    //                 courseFilter &&
    //                 (courseFilter === "" || session.courseCode === courseFilter)
    //             );
    //         });
    //     }
    // }, [roomFilterValue, roomActiveFilter, sortedClassrooms, courseFilter]);

    return (
        <Container fluid className="pt-2">
            <Row>
                <Col xl={4}>
                    <Form.Label>Search rooms</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Search rooms..."
                        onChange={(e) => {
                            setRoomFilterValue(e.target.value);
                        }}
                    />
                </Col>
                <Col xl={4}>
                    <Form.Label>Filter courses</Form.Label>
                    <Select
                        placeholder="Filter course..."
                        options={props.courses.map((code) => {
                            return { value: code, label: code };
                        })}
                        isClearable
                        onChange={(value) => {
                            setCourseFilter(
                                ((value as unknown) as { value: string } | null)
                                    ?.value ?? ""
                            );
                        }}
                    />
                </Col>
                <Col xl={4}>
                    <Form.Label>Filter room status</Form.Label>
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
                                await getClassrooms();
                            }}
                            isRefreshing={requestIsLoading(classroomsResponse)}
                            size="lg"
                            type={
                                session.open
                                    ? RoomType.CLASS
                                    : RoomType.UPCOMING
                            }
                        />
                    );
                })}
            {/* {filteredUpcomingRooms &&
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
                                await getUpcomingClassrooms();
                            }}
                            isRefreshing={requestIsLoading(
                                upcomingClassroomsResponse
                            )}
                            size="lg"
                            type={RoomType.UPCOMING}
                        />
                    );
                })} */}
            <EditClassroomModal
                roomSelection={roomSelection}
                courses={props.courses}
                onClose={() => {
                    setRoomSelection(undefined);
                }}
                refresh={() => {
                    getClassrooms();
                }}
            />
        </Container>
    );
};
