import { useTransformingSocket } from "./useTransformingSocket";

/**
 * Custom hook to listen for a socket event. This uses a global socket which is already connected.
 * @param event The socketIO event to listen to see events.ts for a list of events.
 * @param initialValue Initial state of the data.
 * @param componentDidMount Callback to do something with the socket when the component first loads, e.g emit some special event.
 * @param onEventEmit Callback which triggers when the event we're listening on was emitted.
 * @returns data from the socket, and the socket its self if you still want to do something with the socket.
 * T: Type of the data sent by the socket event.
 * 
 * Example: Listening for a new announcement event.
 * 
 * // Listen for the new announcements event.
 * const { data } = useSocket<string>("NEW_ANNOUNCEMENTS");
 * 
 * // Render the latest announcement
 * return (
 *     {
 *         <div>{announcement}</div>
 *     }
 * )
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
