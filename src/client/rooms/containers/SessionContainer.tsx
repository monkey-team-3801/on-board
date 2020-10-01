import React from "react";
import { Container } from "react-bootstrap";
import socketIOClient from "socket.io-client";
import { RoomEvent } from "../../../events";
import { SessionData } from "../../../types";
import { useFetch } from "../../hooks";
import { requestIsLoaded } from "../../utils";

type Props = {
    roomId: string;
    userId: string;
    children: (
        sessionData: SessionData,
        socket: SocketIOClient.Socket
    ) => React.ReactNode;
    roomType: "breakout" | "private";
};

const socket = socketIOClient("/");

export const SessionContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { roomType, children, roomId, userId } = props;
    const [sessionResponse] = useFetch<SessionData, { id: string }>(
        `/session/${
            roomType === "private" ? "getPrivateSession" : "getBreakoutSession"
        }`,
        {
            id: roomId,
        }
    );

    React.useEffect(() => {
        socket.connect().emit(RoomEvent.SESSION_JOIN, {
            sessionId: roomId,
            userId,
        });
        return () => {
            socket.disconnect();
        };
    }, [roomId, userId]);

    if (!requestIsLoaded(sessionResponse)) {
        return <div>Loading</div>;
    }

    return (
        <Container fluid>{children(sessionResponse.data, socket)}</Container>
    );
};
