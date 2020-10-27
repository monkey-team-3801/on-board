import { useEffect, useState } from "react";
import io from "socket.io-client";

/**
 * Hook to retrieve a new socketIO socket instance.
 */
export const useNewSocket: () => [SocketIOClient.Socket] = () => {
    // TODO: remove rejectUnauthorized for prod
    const [socket] = useState<SocketIOClient.Socket>(io("/"));
    useEffect(() => {
        return () => {
            socket.disconnect();
        };
    }, [socket]);
    return [socket];
};
