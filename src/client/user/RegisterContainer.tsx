import React from "react";
import { Button, Container, Form } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import {
    CreateUserRequestType,
    LoginSuccessResponseType,
    UserType,
} from "../../types";
import { ButtonWithLoadingProp } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestHasError } from "../utils";

type Props = RouteComponentProps & {
    onFetchSuccess: (response: LoginSuccessResponseType) => void;
    toggleRegisterForm: (value: boolean) => void;
};

/**
 * Form container for the register view.
 */
export const RegisterContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [username, setUsername] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const [userType, setUserType] = React.useState<UserType>(UserType.STUDENT);
    const [loading, setLoading] = React.useState<boolean>(false);

    const [userData, registerUser] = useDynamicFetch<
        LoginSuccessResponseType,
        CreateUserRequestType
    >("/user/register", undefined, false, props.onFetchSuccess);

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
        setLoading(true);
        await registerUser({
            username,
            password,
            userType,
        });
        setLoading(false);
    };

    return (
        <div>
            <h1 className="form-heading">REGISTER</h1>
            <Form onSubmit={(e) => handleSubmit(e)}>
                <div className="formcontent">
                    <Form.Group>
                        <Form.Label className="form-label">
                            Account type
                        </Form.Label>
                        <Form.Control
                            className="dropdownbar purple-gradient-input"
                            as="select"
                            onChange={(e) => {
                                changeUserType(e.target.value);
                            }}
                            required
                        >
                            <option value="student">Student</option>
                            <option value="tutor">Tutor</option>
                            <option value="coordinator">Coordinator</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Control
                            className="inputbar purple-gradient-input"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Control
                            className="inputbar purple-gradient-input"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Container>
                        <div className="error-message-container">
                            {requestHasError(userData) && (
                                <p>{userData.message}</p>
                            )}
                        </div>
                    </Container>
                    <ButtonWithLoadingProp
                        variant="primary"
                        type="submit"
                        className="registerbtn"
                        loading={loading}
                        invertLoader
                    >
                        Register
                    </ButtonWithLoadingProp>
                </div>
            </Form>
            <div className="toggle-button">
                <Button
                    variant="light"
                    type="submit"
                    size="sm"
                    className="toggle-button"
                    onClick={() => {
                        props.toggleRegisterForm(false);
                    }}
                >
                    I have an account
                </Button>
            </div>
        </div>
    );
};
