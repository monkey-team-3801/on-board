import React from "react";
import { RouteComponentProps } from "react-router-dom";

import { useFetch } from "../hooks";
import { ChatContainer } from "../chat";
import { requestIsLoaded } from "../utils";

type Props = RouteComponentProps<{ roomId: string }> & {};

export const PrivateRoomContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [name, setName] = React.useState<string>("");

    const [sessionResponse] = useFetch<any, any>("/session/getSession", {
        id: props.match.params.roomId,
    });

    if (!requestIsLoaded(sessionResponse)) {
        return <div>loading...</div>;
    }

    return (
        <div>
            <div>private room page</div>
            <div>id: {props.match.params.roomId}</div>
            <br />
            Your name:{" "}
            <input
                onChange={(e) => {
                    setName(e.target.value);
                }}
            />
            <ChatContainer
                roomId={props.match.params.roomId}
                username={name}
                initialChatLog={sessionResponse.data.messages}
            />
        </div>
    );
};
