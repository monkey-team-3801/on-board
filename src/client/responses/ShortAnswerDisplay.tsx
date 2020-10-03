import React from "react";
import { Button, Form } from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    formID: string;
    question: string;
    uid: string;
    back: Function;
    sock: SocketIOClient.Socket;
    sid: string;
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
        props.sock.emit(ResponseFormEvent.NEW_RESPONSE, props.sid);
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
            <h1>{props.question}</h1>
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
                {!userAnswered.data.found ? (
                    <Button type="submit">submit</Button>
                ) : (
                    <div style={{ color: "red" }}>
                        You have already answered.
                    </div>
                )}
                {!userAnswered.data.found && !userResponse && (
                    <div style={{ color: "red" }}>Please enter a response</div>
                )}
            </Form>
        </div>
    );
};
