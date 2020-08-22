import React from "react";
import { useDynamicFetch } from "../hooks";
import { CreateUserRequestType, LoginUserRequestType } from "../../types";

export const LoginContainer = () => {
    const [username, setUsername] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    const [data, loginUser] = useDynamicFetch<undefined, LoginUserRequestType>(
        "user/login",
        undefined,
        false
    );

    let handleSubmit = function (event: any) {
        event.preventDefault();
        //console.log(username, password);

        loginUser({ username: username, password: password });
    };

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
