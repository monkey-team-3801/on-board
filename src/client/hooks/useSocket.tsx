import { useTransformingSocket } from "./useTransformingSocket";

/**
 * Custom hook to listen on a socket event.
 * @param event The socketIO event to listen to
 * @param initialValue Initial data value
 * @param T Initial data type
 */
export const useSocket = <T extends any>(
    event: string,
    componentDidMount: (socket: SocketIOClient.Socket) => SocketIOClient.Socket,
    initialValue?: T
): [T | undefined, SocketIOClient.Socket] => {
    const { data, socket } = useTransformingSocket<T>(
        event,
        componentDidMount,
        (prev: T | undefined) => {
            return prev;
        },
        initialValue
    );
    return [data, socket];
};
