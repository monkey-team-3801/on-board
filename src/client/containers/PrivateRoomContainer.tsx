import React from "react";
import { RouteComponentProps } from "react-router-dom";

type Props = RouteComponentProps<{ roomId: string }> & {};

export const PrivateRoomContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <div>
            <div>private room page</div>
            <div>id: {props.match.params.roomId}</div>
        </div>
    );
};
