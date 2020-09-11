import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { TopLayerContainerProps } from "../types";
import { requestIsLoaded } from "../utils";
import { useFetch } from "../hooks";
import { ClassroomSessionData } from "../../types";

type Props = RouteComponentProps<{ classroomId: string }> &
    TopLayerContainerProps & {};

export const ClassroomPageContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [sessionResponse] = useFetch<ClassroomSessionData, { id: string }>(
        "/session/getClassroomSession",
        {
            id: props.match.params.classroomId,
        }
    );

    if (!requestIsLoaded(sessionResponse)) {
        return <div>Loading</div>;
    }

    return (
        <div>
            <h1>
                {sessionResponse.data.courseCode} Classroom:{" "}
                {sessionResponse.data.name}
            </h1>
            <p>Description: {sessionResponse.data.description}</p>
            <p>Start time: {sessionResponse.data.startTime}</p>
            <p>End time: {sessionResponse.data.endTime}</p>
            <div>id: {props.match.params.classroomId}</div>
        </div>
    );
};
