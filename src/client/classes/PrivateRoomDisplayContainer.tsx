import React from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { RoomType, SessionInfo } from "../../types";
import { useFetch } from "../hooks";
import { UserData } from "../rooms/types";
import { requestIsLoaded, requestIsLoading } from "../utils";
import { ClassContainer } from "./ClassContainer";
import { EditPrivateRoomModal } from "./EditPrivateRoomModal";

type Props = RouteComponentProps & {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    userData: UserData;
    courses: Array<string>;
};

export const PrivateRoomDisplayContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading, history } = props;

    const [privateRoomResponse, getPrivateRooms] = useFetch<Array<SessionInfo>>(
        "session/privateSessions"
    );

    const [roomFilterValue, setRoomFilterValue] = React.useState<string>("");

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
        if (requestIsLoaded(privateRoomResponse)) {
            setLoading(false);
            setDeletedRooms([]);
        }
    }, [privateRoomResponse, setLoading]);

    const filteredRooms = React.useMemo(() => {
        return privateRoomResponse.data?.filter((session) => {
            if (deletedRooms.includes(session.id)) {
                return false;
            }
            return session.name
                .toLocaleLowerCase()
                .includes(roomFilterValue.toLocaleLowerCase());
        });
    }, [roomFilterValue, privateRoomResponse, deletedRooms]);

    return (
        <Container fluid className="pt-2">
            <Row>
                <Col xl={12}>
                    <Form.Control
                        type="text"
                        placeholder="Search rooms..."
                        onChange={(e) => {
                            setRoomFilterValue(e.target.value);
                        }}
                    />
                </Col>
            </Row>
            {filteredRooms &&
                filteredRooms.map((session, i) => {
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
                            isRefreshing={requestIsLoading(privateRoomResponse)}
                            canJoin
                            size="lg"
                            type={RoomType.PRIVATE}
                            setDeletedRooms={setDeletedRooms}
                        />
                    );
                })}
            <EditPrivateRoomModal
                courses={props.courses}
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
