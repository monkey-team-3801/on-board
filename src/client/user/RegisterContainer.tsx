import React from "react";
import { Redirect } from "react-router-dom";
import { Form, Button } from "react-bootstrap";

import { useDynamicFetch } from "../hooks";
import {
    UserType,
    CreateUserRequestType,
    LoginSuccessResponseType,
} from "../../types";
import { RequestState } from "../types";

type Props = {
    onFetchSuccess: (response: LoginSuccessResponseType) => void;
    toggleRegisterForm: (value: boolean) => void;
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
        event: React.FormEvent<HTMLElement>
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
            <Form onSubmit={(e) => handleSubmit(e)}>
                <Form.Group>
                    <Form.Label>Account type</Form.Label>
                    <Form.Control
                        as="select"
                        onChange={(e) => {
                            changeUserType(e.target.value);
                        }}
                    >
                        <option value="student">Student</option>
                        <option value="tutor">Tutor</option>
                        <option value="coordinator">Coordinator</option>
                    </Form.Control>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Register
                </Button>
            </Form>
            <Button
                variant="light"
                type="submit"
                size="sm"
                className="toggle-button"
                onClick={() => {
                    props.toggleRegisterForm(false);
                }}
            >
                Login
            </Button>
        </div>
    );
};
