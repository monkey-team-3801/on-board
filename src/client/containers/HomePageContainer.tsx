import React from "react";
import { Link } from "react-router-dom";

import { useFetch, useDynamicFetch } from "../hooks";
import { SessionResponseType } from "../../types";
import { requestIsLoaded } from "../utils";
import { RequestState } from "../types";

type Props = {};

export const HomePageContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [roomName, setRoomName] = React.useState<string>("");

    const [sessionResponse, refresh] = useFetch<SessionResponseType>(
        "session/sessions"
    );

    const [createRoomResponse, createRoom] = useDynamicFetch<
        undefined,
        { name: string }
    >("session/create", undefined, false);

    const [deleteRoomResponse, deleteRoom] = useDynamicFetch<
        undefined,
        { id: string }
    >("session/delete", undefined, false);

    if (createRoomResponse.state === RequestState.ERROR) {
        return <div>Error while creating room</div>;
    }

    if (deleteRoomResponse.state === RequestState.ERROR) {
        return <div>Error while deleting room</div>;
    }

    return (
        <div>
            <input
                type="text"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setRoomName(e.target.value);
                }}
            />
            <button
                onClick={async () => {
                    if (roomName !== "") {
                        await createRoom({
                            name: roomName,
                        });
                        await refresh();
                    }
                }}
            >
                Create room
            </button>
            <div>
                <p>Active sessions: </p>
                {requestIsLoaded(sessionResponse) &&
                    sessionResponse.data.sessions.map((session, i) => {
                        return (
                            <div key={session.id}>
                                {`${i + 1}. `}
                                <Link
                                    to={`/room/${session.id}`}
                                >{`${session.name}`}</Link>
                                <button
                                    style={{ marginLeft: 10 }}
                                    onClick={async () => {
                                        await deleteRoom({
                                            id: session.id,
                                        });
                                        await refresh();
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};
