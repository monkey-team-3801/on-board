import { useEffect, useState } from "react";
import io from "socket.io-client";

export const useNewSocket: () => [SocketIOClient.Socket] = () => {
    const [socket] = useState<SocketIOClient.Socket>(io("/"));
    useEffect(() => {
        return () => {
            socket.disconnect();
        };
    }, [socket]);
    return [socket];
};
