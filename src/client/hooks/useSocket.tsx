import { useTransformingSocket } from "./useTransformingSocket";

/**
 * Custom hook to listen on a socket event.
 * @param event The socketIO event to listen to
 * @param initialValue Initial data value
 * @param T Initial data type
 */
export const useSocket = <T extends any>(
    event: string,
    initialValue?: T,
    componentDidMount?: (
        socket: SocketIOClient.Socket
    ) => SocketIOClient.Socket,
    onEventEmit?: () => void
): { data: T | undefined; socket: SocketIOClient.Socket } => {
    const { data, socket } = useTransformingSocket<T, T>(
        event,
        initialValue,
        componentDidMount,
        (prev: T | undefined, data: T) => {
            return data;
        },
        onEventEmit
    );

    return { data, socket };
};
