import React from "react";
import { useDynamicFetch } from "../hooks";
import { LoginUserRequestType, LoginUserResponseType } from "../../types";
import { Redirect } from "react-router-dom";

export const LoginContainer = () => {
    const [username, setUsername] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    const [userID, loginUser] = useDynamicFetch<
        LoginUserResponseType,
        LoginUserRequestType
    >("user/login", undefined, false);

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        await loginUser({ username: username, password: password });
        // This is the user ID:
        console.log(userID.data?.id);
    };

    if (userID.data?.id !== undefined) {
        return <Redirect to={"/home"} />;
    }

    return (
        <div>
            <h1>login test</h1>
            <form onSubmit={(e) => handleSubmit(e)}>
                <label htmlFor="username">Enter Username</label>
                <br></br>

                <input
                    name="username"
                    type="text"
                    placeholder="username"
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <br></br>

                <label htmlFor="password">Enter Password</label>
                <br></br>

                <input
                    name="password"
                    type="password"
                    placeholder="password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <br></br>

                <button type="submit">login</button>
            </form>
        </div>
    );
};
