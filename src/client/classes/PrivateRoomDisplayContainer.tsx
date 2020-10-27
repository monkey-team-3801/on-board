import React from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import Select from "react-select";
import { RoomType, SessionInfo } from "../../types";
import { useFetch } from "../hooks";
import { UserData } from "../rooms/types";
import { requestIsLoaded, requestIsLoading } from "../utils";
import { ClassContainer } from "./ClassContainer";
import { EditPrivateRoomModal } from "./EditPrivateRoomModal";
import FadeIn from "react-fade-in";

type Props = RouteComponentProps & {
    // Setter for the loading state.
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    // Current user data.
    userData: UserData;
    // List of courses the user is enrolled in.
    courses?: Array<string>;
};

/**
 * Single container wrapper for displaying a list of private rooms.
 */
export const PrivateRoomDisplayContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading, history, courses } = props;

    const [privateRoomResponse, getPrivateRooms] = useFetch<Array<SessionInfo>>(
        "session/privateSessions"
    );

    const [roomFilterValue, setRoomFilterValue] = React.useState<string>("");
    const [courseFilter, setCourseFilter] = React.useState<string>("");

    const [deletedRooms, setDeletedRooms] = React.useState<Array<string>>([]);

    const [roomSelection, setRoomSelection] = React.useState<
        | {
              id?: string;
              name: string;
              description: string;
              courseCode?: string;
          }
        | undefined
    >();

    const onRoomJoinClick = React.useCallback(
        (id: string) => {
            history.push(`/room/${id}`);
        },
        [history]
    );

    React.useEffect(() => {
        if (requestIsLoaded(privateRoomResponse) && courses) {
            setLoading(false);
            setDeletedRooms([]);
        }
    }, [privateRoomResponse, setLoading, courses]);

    const filteredRooms = React.useMemo(() => {
        return privateRoomResponse.data?.filter((session) => {
            if (deletedRooms.includes(session.id)) {
                return false;
            }
            return (
                session.name
                    .toLocaleLowerCase()
                    .includes(roomFilterValue.toLocaleLowerCase()) &&
                (courseFilter === "" || session.courseCode === courseFilter)
            );
        });
    }, [roomFilterValue, privateRoomResponse, deletedRooms, courseFilter]);

    return (
        <Container fluid className="pt-2">
            <Row>
                <Col xl={6}>
                    <Form.Label>Search rooms</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Search rooms..."
                        onChange={(e) => {
                            setRoomFilterValue(e.target.value);
                        }}
                    />
                </Col>
                <Col xl={6}>
                    <Form.Label>Filter courses</Form.Label>
                    <Select
                        placeholder="Filter course..."
                        options={props.courses?.map((code) => {
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
            </Row>
            {filteredRooms && (
                <FadeIn delay={100}>
                    {filteredRooms.map((session, i) => {
                        return (
                            <ClassContainer
                                {...session}
                                key={session.id}
                                canEdit={
                                    props.userData.id === session.createdBy
                                }
                                onJoinClick={() => {
                                    onRoomJoinClick(session.id);
                                }}
                                onEditClick={() => {
                                    setRoomSelection({
                                        id: session.id,
                                        name: session.name,
                                        description: session.description,
                                        courseCode: session.courseCode,
                                    });
                                }}
                                courseCode={session?.courseCode || "PRIVATE"}
                                onDeleteClick={async () => {
                                    await getPrivateRooms();
                                }}
                                isRefreshing={requestIsLoading(
                                    privateRoomResponse
                                )}
                                size="lg"
                                type={RoomType.PRIVATE}
                                open={true}
                                setDeletedRooms={setDeletedRooms}
                                currentUserId={props.userData.id}
                            />
                        );
                    })}
                </FadeIn>
            )}
            <EditPrivateRoomModal
                courses={props.courses || []}
                roomSelection={roomSelection}
                onClose={() => {
                    setRoomSelection(undefined);
                }}
                refresh={() => {
                    getPrivateRooms();
                }}
            />
        </Container>
    );
};
