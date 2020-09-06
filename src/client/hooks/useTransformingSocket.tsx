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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [transformSocketData]
    );

    React.useEffect(() => {
        if (componentDidMount) {
            componentDidMount(socket).on(event, onEvent);
        } else {
            socket.on(event, onEvent);
        }
        // Somewhat dangerious to use this rule here.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);

    return { data, setData, socket };
};
