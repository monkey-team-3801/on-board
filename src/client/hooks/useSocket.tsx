import { useTransformingSocket } from "./useTransformingSocket";

/**
 * Custom hook to listen on a socket event.
 * @param event The socketIO event to listen to
 * @param initialValue Initial data value
 * @param T Initial data type
 */
export const useSocket = <T extends any>(
    event: string,
    initialValue?: T
): [T | undefined] => {
    const [data] = useTransformingSocket<T>(
        event,
        (prev: T | undefined) => {
            return prev;
        },
        initialValue
    );
    return [data];
};
