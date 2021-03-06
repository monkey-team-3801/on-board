import React from "react";
import { Container } from "react-bootstrap";
import socketIOClient from "socket.io-client";
import { useDebouncedCallback } from "use-debounce/lib";
import { RoomEvent } from "../../../events";
import { SessionData, UserDataResponseType, RoomType } from "../../../types";
import { Loader } from "../../components";
import { useFetch } from "../../hooks";
import { requestIsLoaded } from "../../utils";
import "../room.less";
import { PeerContext } from "../../peer";
import { useMyPeer } from "../../hooks/useMyPeer";

type Props = {
    // Current session/room id.
    roomId: string;
    // Current user id.
    userId: string;
    // Forwarded children callback passing though the required data.
    children: (
        sessionData: SessionData,
        users: Array<Omit<UserDataResponseType, "courses">> | undefined,
        socket: SocketIOClient.Socket
    ) => React.ReactNode;
    // Room type.
    roomType: RoomType;
};

const socket = socketIOClient("/");

/**
 * Container wrapper for a single session.
 */
export const SessionContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { roomType, children, roomId, userId } = props;

    const peerData = useMyPeer(socket, userId, roomId);

    const [sessionResponse] = useFetch<SessionData, { id: string }>(
        `/session/${
            roomType === RoomType.PRIVATE
                ? "getPrivateSession"
                : "getBreakoutSession"
        }`,
        {
            id: roomId,
        }
    );

    const [sessionUsersResponse, fetchUsers] = useFetch<
        { users: Array<Omit<UserDataResponseType, "courses">> },
        { sessionId: string }
    >(
        "/session/getSessionUsers",
        {
            sessionId: roomId,
        },
        false
    );

    const fetchSessionUsers = useDebouncedCallback(fetchUsers, 1000);

    const onUserJoinOrLeave = React.useCallback(() => {
        fetchSessionUsers.callback();
    }, [fetchSessionUsers]);

    React.useEffect(() => {
        socket
            .connect()
            .on(RoomEvent.SESSION_JOIN, onUserJoinOrLeave)
            .on(RoomEvent.SESSION_LEAVE, onUserJoinOrLeave)
            .emit(RoomEvent.SESSION_JOIN, {
                userId,
                sessionId: roomId,
            });
        fetchSessionUsers.callback();
        return () => {
            socket
                .disconnect()
                .off(RoomEvent.SESSION_JOIN, onUserJoinOrLeave)
                .off(RoomEvent.SESSION_LEAVE, onUserJoinOrLeave);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!requestIsLoaded(sessionResponse)) {
        return <Loader full />;
    }

    return (
        <PeerContext.Provider value={peerData}>
            <Container fluid className="p-0">
                {children(
                    sessionResponse.data,
                    sessionUsersResponse.data?.users,
                    socket
                )}
            </Container>
        </PeerContext.Provider>
    );
};
