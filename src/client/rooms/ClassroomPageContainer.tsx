import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { TopLayerContainerProps } from "../types";

type Props = RouteComponentProps<{ classroomId: string }> & TopLayerContainerProps & {};

export const ClassroomPageContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <div>
            <div>classroom page room page</div>
            <div>id: {props.match.params.classroomId}</div>
        </div>
    );
};
