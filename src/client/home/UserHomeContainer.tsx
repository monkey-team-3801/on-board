import React from "react";
import { RouteComponentProps } from "react-router-dom";

import { useFetch } from "../hooks";
import { UserDataResponseType } from "../../types";
import { LocalStorageKey } from "../types";
import { CreateRoomPage } from "../rooms/CreateRoomPage";
import { requestIsLoaded } from "../utils";

type Props = RouteComponentProps & {};

export const UserHomeContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [userDataResponse] = useFetch<UserDataResponseType>("user/data");

    if (!requestIsLoaded(userDataResponse)) {
        return <div>Loading</div>;
    }

    return (
        <div>
            <h1>User Home Page</h1>
            <p>
                Logged in as {userDataResponse.data.username}:{" "}
                {userDataResponse.data.id}
            </p>
            <CreateRoomPage />
            <button
                onClick={() => {
                    localStorage.setItem(LocalStorageKey.JWT_TOKEN, "");
                    props.history.replace("/");
                }}
            >
                Logout
            </button>
        </div>
    );
};
