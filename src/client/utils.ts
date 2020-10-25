import {
    BaseResponseType,
    RequestState,
    ErrorResponseType,
    CourseOptionType,
} from "./types";

import { ResponseType } from "./types";
import { UserType } from "../types";

/**
 * Type guard to check if a request was loaded.
 * @param responseType Request response.
 */
export const requestIsLoaded = <T>(
    responseType: BaseResponseType<T>
): responseType is ResponseType<T> => {
    return responseType.state === RequestState.LOADED;
};

/**
 * Type guard to check if a request is loading.
 * @param responseType Request response.
 */
export const requestIsLoading = <T>(
    responseType: BaseResponseType<T>
): responseType is ResponseType<T> => {
    return responseType.state === RequestState.LOADING;
};

/**
 * Type guard to check if a request has errored.
 * @param responseType Request response.
 */
export const requestHasError = <T>(
    responseType: BaseResponseType<T>
): responseType is ErrorResponseType => {
    return responseType.state === RequestState.ERROR;
};

/**
 * Type guard to check if a request was unauthorised.
 * @param responseType Request response.
 */
export const requestIsUnauthorised = <T>(
    responseType: BaseResponseType<T>
): responseType is ErrorResponseType => {
    return responseType.state === RequestState.UNAUTHORISED;
};

/**
 * Throttles a function by some ms.
 * @param callback Function to throttle
 * @param delay Delay in ms
 */
export const throttle = (callback: any, delay: number) => {
    let previousCall = new Date().getTime();
    return function () {
        const time = new Date().getTime();
        if (time - previousCall >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
};

export const isOptionType = (option: any): option is CourseOptionType => {
    return option?.value && option?.label;
};

export const baseRoomTypeOptions = [
    {
        value: "Lecture",
        label: "Lecture",
    },
    {
        value: "Tutorial",
        label: "Tutorial",
    },
    {
        value: "Practical",
        label: "Practical",
    },
    {
        value: "Studio",
        label: "Studio",
    },
];

export const userTypeToClass = (userType: UserType) => {
    switch (userType) {
        case UserType.STUDENT:
            return "student";
        case UserType.TUTOR:
            return "tutor";
        case UserType.COORDINATOR:
            return "coordinator";
    }
};

export const isStaff = (userType: UserType) => {
    return userType !== UserType.STUDENT;
};
