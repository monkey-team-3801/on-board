import React, { MutableRefObject } from "react";
import axios from "axios";

import { RequestState, BaseResponseType } from "../types";
import { AnyObjectMap } from "../../server/types";

/**
 * Custom hook to fetch data from some api endpoint, but allows new request data to be
 * sent to the same route.
 * @param apiEndpoint API endpoint
 * @param apiRequestData Data to send
 * @param invokeImmediately Fetches on first render if true
 * @param T: Response data type
 * @param S: Request data type
 */
export const useDynamicFetch = <
    T,
    S extends AnyObjectMap<any> | undefined = undefined
>(
    apiEndpoint: string,
    apiRequestData?: S,
    invokeImmediately: boolean | undefined = true,
    onFetchSuccess?: () => void,
    onFetchError?: () => void
): [BaseResponseType<T>, (newRequestData: S | undefined) => Promise<void>] => {
    const componentMounted: MutableRefObject<boolean> = React.useRef<boolean>(
        false
    );

    const [responseType, setResponseType] = React.useState<BaseResponseType<T>>(
        {
            state: RequestState.LOADING,
            data: undefined,
        }
    );

    const fetchData = React.useCallback(
        async (endpoint: string, requestData?: AnyObjectMap<any>) => {
            try {
                const response = await axios.post<T>(endpoint, requestData);
                setResponseType({
                    state: RequestState.LOADED,
                    data: response.data,
                });
                onFetchSuccess?.();
            } catch (e) {
                setResponseType({
                    state: RequestState.ERROR,
                    data: undefined,
                });
                onFetchError?.();
            }
        },
        [onFetchSuccess, onFetchError]
    );

    const refetch = React.useCallback(
        async (newRequestData: S | undefined) => {
            await fetchData(apiEndpoint, newRequestData);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [fetchData, apiEndpoint]
    );

    React.useEffect(() => {
        if (componentMounted.current || invokeImmediately) {
            fetchData(apiEndpoint, apiRequestData);
        } else {
            componentMounted.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchData, apiEndpoint]);

    return [responseType, refetch];
};
