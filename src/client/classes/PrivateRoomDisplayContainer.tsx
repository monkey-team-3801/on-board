import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { SessionDeleteRequestType, SessionInfo } from "../../types";
import { useDynamicFetch, useFetch } from "../hooks";
import { requestIsLoaded, requestIsLoading } from "../utils";
import { ClassContainer } from "./ClassContainer";
import { UserData } from "../rooms/types";

type Props = RouteComponentProps & {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    userData: UserData;
};

export const PrivateRoomDisplayContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading, history } = props;

    const [privateRoomResponse, getPrivateRooms] = useFetch<Array<SessionInfo>>(
        "session/privateSessions"
    );

    const [deleteRoomResponse, deleteRoom] = useDynamicFetch<
        undefined,
        SessionDeleteRequestType
    >("session/delete/privateRoom", undefined, false);

    const onRoomJoinClick = React.useCallback(
        (id: string) => {
            history.push(`/room/${id}`);
        },
        [history]
    );

    React.useEffect(() => {
        if (requestIsLoaded(privateRoomResponse)) {
            setLoading(false);
        }
    }, [privateRoomResponse, setLoading]);

    return (
        <Container fluid>
            {privateRoomResponse.data &&
                privateRoomResponse.data.map((session, i) => {
                    return (
                        <ClassContainer
                            {...session}
                            key={session.id}
                            canEdit={props.userData.id === session.createdBy}
                            onEditClick={() => {
                                // setRoomSelection({
                                //     data: session,
                                //     type: RoomType.UPCOMING,
                                // });
                            }}
                            courseCode={session?.courseCode || "PRIVATE"}
                            onDeleteClick={async () => {
                                await deleteRoom({
                                    id: session.id,
                                });
                                await getPrivateRooms();
                            }}
                            isDeleting={
                                requestIsLoading(deleteRoomResponse) ||
                                requestIsLoading(privateRoomResponse)
                            }
                            canJoin
                            size="lg"
                        />
                    );
                })}
        </Container>
    );
};
