import React from "react";
import { ExecutingEvent } from "../../events";
import {
    CreateClassroomJobRequestType,
    UpcomingClassroomSessionData,
} from "../../types";
import { useDynamicFetch } from "../hooks";
import { requestIsLoading } from "../utils";
import { ScheduleRoomFormContainer } from "./ScheduleRoomFormContainer";

type Props = {
    // Setter for the loading state.
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    // Refresh key for force refreshing components.
    refreshKey: number;
    // List of courses the user is enrolled in.
    courses: Array<string>;
};

/**
 * Container responsible for creating a classroom.
 */
export const CreateClassroomContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [createClassroomResponse, createClassroom] = useDynamicFetch<
        undefined,
        CreateClassroomJobRequestType
    >("/job/create", undefined, false);

    return (
        <ScheduleRoomFormContainer
            setLoading={props.setLoading}
            response={createClassroomResponse}
            refreshKey={props.refreshKey}
            courses={props.courses}
            submitting={requestIsLoading(createClassroomResponse)}
            onSubmit={async (
                data: Omit<UpcomingClassroomSessionData, "id" | "open">
            ) => {
                await createClassroom({
                    executingEvent: ExecutingEvent.CLASS_OPEN,
                    ...data,
                });
            }}
        />
    );
};
