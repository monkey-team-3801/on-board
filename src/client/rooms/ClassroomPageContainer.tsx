import React from "react";
import { RouteComponentProps } from "react-router-dom";

type Props = RouteComponentProps<{ classroomId: string }> & {};

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
