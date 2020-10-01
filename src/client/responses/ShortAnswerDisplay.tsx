import React from "react";
import { Button, Form } from "react-bootstrap";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    formID: string;
    q: string;
    uid: string;
    back: Function;
};

export const ShortAnswerDisplay = (props: Props) => {
    const [userResponse, setUserResponse] = React.useState<string>("");

    const [userAnswered] = useDynamicFetch<
        { found: boolean },
        { userID: string; formID: string }
    >(
        "/response-handler/checkAnswered",
        { userID: props.uid, formID: props.formID },
        true
    );

    const [, submitForm] = useDynamicFetch<
        undefined,
        {
            userID: string;
            userResponse: string;
            formID: string;
        }
    >("/response-handler/answerShortAnswer", undefined, false);

    if (!requestIsLoaded(userAnswered)) {
        return <div>loading...</div>;
    }

    const submit = async (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        await submitForm({
            userID: props.uid,
            userResponse: userResponse,
            formID: props.formID,
        });
        props.back(0);
    };

    return (
        <div>
            <Button
                onClick={() => {
                    props.back(0);
                }}
            >
                Back
            </Button>
            <h1>{props.q}</h1>
            <Form
                onSubmit={(e) => {
                    submit(e);
                }}
            >
                <Form.Label>Enter your response here:</Form.Label>
                <Form.Control
                    as="textarea"
                    onChange={(e) => {
                        setUserResponse(e.target.value);
                    }}
                    disabled={userAnswered.data.found}
                />
                <br></br>
                {!userAnswered.data.found && (
                    <Button type="submit">submit</Button>
                )}
                {!userAnswered.data.found && !userResponse && (
                    <div style={{ color: "red" }}>Please enter a response</div>
                )}
                {userAnswered.data.found && (
                    <div style={{ color: "red" }}>
                        You have already answered.
                    </div>
                )}
            </Form>
        </div>
    );
};
