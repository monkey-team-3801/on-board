import React from "react";
import { socket } from "../io";

/**
 * Custom hook to listen on a socket event, with a optional argument which transforms the data.
 * @param event The socketIO event to listen to see events.ts for a list of events.
 * @param initialValue Initial state of the data.
 * @param componentDidMount Callback to do something with the socket when the component first loads, e.g emit some special event.
 * @param transformSocketData Transform the data sent by the socket to from type S to type T.
 * @param onEventEmit Callback which triggers when the event we're listening on was emitted.
 * @returns data from the socket, and the socket its self if you still want to do something with the socket. This also optionally returns the setter
 * for the state, which could be useful in some cases, however currently its only used in the chat for a instant response.
 * S: Type of the data sent by the socket event.
 * T: Type of data stored by the React state.
 *
 * Example: Listening for a new announcement event, but instead of rendering just the new announcement, we push it to the existing array of announcements to generate an list..
 *
 * // Listen for the new announcements event, initialise the state as a empty array.
 * const { data } = useSocket<string, Array<string>>("NEW_ANNOUNCEMENTS", [], undefined, (prevState, newData) => {
 *     // Here the socket will send a string, but our internal state is a array, so we simply need to append the data to the list.
 *     if (prevState && data) {
 *         return prevState.concat([newData]);
 *     }
 *     return prevState; // Make no changes if prevState or newData is not initialised.
 *
 * });
 *
 * // Render the list of announcements
 * return (
 *     {
 *         data.map((announcement) => {
 *             <div>{announcement}</div>
 *         })
 *     }
 * )
 */
export const useTransformingSocket = <T extends any, S extends any = any>(
    event: string,
    initialValue?: T,
    componentDidMount?: (
        socket: SocketIOClient.Socket
    ) => SocketIOClient.Socket,
    transformSocketData?: (prev: T | undefined, data: S) => T | undefined,
    onEventEmit?: (data: S) => void
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
            onEventEmit?.(data);
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
