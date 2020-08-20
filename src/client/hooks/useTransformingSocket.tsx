import React from "react";
import socketIOClient from "socket.io-client";

/**
 * Custom hook to listen on a socket event, with a optional argument which transforms the data.
 * @param event The socketIO event to listen to
 * @param transformSocketData Callback reducer like method which updates the state with the new data
 * @param initialValue Initial data value
 */
export const useTransformingSocket = <T extends any, S extends any = any>(
    event: string,
    transformSocketData: (prev: T, data: S) => T | undefined,
    initialValue?: T
) => {
    const [data, setData] = React.useState<T | undefined>(initialValue);

    const transformData = React.useCallback(
        (prev, data) => {
            return transformSocketData(prev, data);
        },
        [transformSocketData]
    );

    React.useEffect(() => {
        const socket: SocketIOClient.Socket = socketIOClient("/");
        socket.on(event, (data: S) => {
            setData((prev: T | undefined) => {
                return transformData(prev, data);
            });
        });
        return () => {
            socket.disconnect();
        };
    }, [event, setData, transformData]);

    return [data];
};
