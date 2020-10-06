import React from "react";
import { ExecutingEvent } from "../../events";
import {
    CreateClassroomJobRequestType,
    UpcomingClassroomSessionData,
} from "../../types";
import { useDynamicFetch } from "../hooks";
import { ScheduleRoomFormContainer } from "./ScheduleRoomFormContainer";

type Props = {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

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
            onSubmit={async (
                data: Omit<UpcomingClassroomSessionData, "id">
            ) => {
                await createClassroom({
                    jobDate: data.startTime,
                    executingEvent: ExecutingEvent.CLASS_OPEN,
                    data,
                });
            }}
        />
    );
};
