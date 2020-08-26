import React from "react";
import { useDynamicFetch } from "../hooks";
import {
    UserType,
    CreateUserRequestType,
    LoginSuccessResponseType,
} from "../../types";
import { RequestState } from "../types";
import { Redirect } from "react-router-dom";

type Props = {
    onFetchSuccess: (response: LoginSuccessResponseType) => void;
};

export const RegisterContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [username, setUsername] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [userType, setUserType] = React.useState<UserType>(UserType.STUDENT);

    const [data, registerUser] = useDynamicFetch<
        LoginSuccessResponseType,
        CreateUserRequestType
    >("user/register", undefined, false, props.onFetchSuccess);

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

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        await registerUser({
            username,
            password,
            userType,
        });
    };

    if (data.state === RequestState.LOADED) {
        return <Redirect to={"/home"} />;
    }

    return (
        <div>
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
