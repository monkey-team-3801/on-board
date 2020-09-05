import React from "react";
import { socket } from "../io";

/**
 * Custom hook to listen on a socket event, with a optional argument which transforms the data.
 * @param event The socketIO event to listen to
 * @param transformSocketData Callback reducer like method which updates the state with the new data
 * @param initialValue Initial data value
 */
export const useTransformingSocket = <T extends any, S extends any = any>(
    event: string,
    initialValue?: T,
    componentDidMount?: (
        socket: SocketIOClient.Socket
    ) => SocketIOClient.Socket,
    transformSocketData?: (prev: T | undefined, data: S) => T | undefined,
    onEventEmit?: () => void
): {
    data: T | undefined;
    setData: React.Dispatch<React.SetStateAction<T | undefined>>;
    socket: SocketIOClient.Socket;
} => {
    const [data, setData] = React.useState<T | undefined>(initialValue);

    const onEvent = React.useCallback(
        (data: S) => {
            setData((prev: T | undefined) => {
                return transformSocketData?.(prev, data);
            });
            onEventEmit?.();
        },
        [transformSocketData, onEventEmit]
    );

    React.useEffect(() => {
        if (componentDidMount) {
            componentDidMount(socket.connect()).on(event, onEvent);
        } else {
            socket.connect().on(event, onEvent);
        }
        return () => {
            socket.disconnect();
        };
    }, [event, setData, transformSocketData, componentDidMount, onEvent]);

    return { data, setData, socket };
};
