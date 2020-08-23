import React from "react";
import { useDynamicFetch } from "../hooks";
import { UserType, CreateUserRequestType } from "../../types";
import { RequestState } from "../types";
import { Redirect } from "react-router-dom";

export const RegisterContainer = () => {
    const [username, setUsername] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [userType, setUserType] = React.useState<UserType>(UserType.STUDENT);

    const [data, registerUser] = useDynamicFetch<any, CreateUserRequestType>(
        "user/register",
        undefined,
        false
    );

    const changeUserType = (type: string): void => {
        switch (type) {
            case "student":
                setUserType(UserType.STUDENT);
                break;
            case "tutor":
                setUserType(UserType.TUTOR);
                break;
            case "coordinator":
                setUserType(UserType.COORDINATOR);
                break;
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        await registerUser({
            username: username,
            password: password,
            userType: userType,
        });
    };

    if (data.state === RequestState.LOADED) {
        return <Redirect to={"/home"} />;
    }

    return (
        <div>
            <h1>registration test</h1>
            <form onSubmit={(e) => handleSubmit(e)}>
                <label htmlFor="Account Type">Select Account Type</label>
                <br></br>

                <select onChange={(e) => changeUserType(e.target.value)}>
                    <option value={"student"}>Student</option>
                    <option value={"tutor"}>Tutor</option>
                    <option value={"coordinator"}>Coordinator</option>
                </select>
                <br></br>

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

                <button type="submit">Register Account</button>
            </form>
        </div>
    );
};
