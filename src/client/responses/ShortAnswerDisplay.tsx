import React from "react";
import { Button, Form, Alert } from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { ResponseFormType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded, requestIsLoading } from "../utils";
import { Loader, ButtonWithLoadingProp } from "../components";

type Props = {
    formID: string;
    question: string;
    uid: string;
    back: Function;
    sock: SocketIOClient.Socket;
    sid: string;
    formType: ResponseFormType;
};

export const ShortAnswerDisplay = (props: Props) => {
    const { formID } = props;
    const [userResponse, setUserResponse] = React.useState<string>("");
    const [submitting, setSubmitting] = React.useState<boolean>(false);

    React.useEffect(() => {
        setSubmitting(false);
    }, [formID]);

    const [userAnswered] = useDynamicFetch<
        { found: boolean },
        { userID: string; formID: string; formType: ResponseFormType }
    >(
        "/response-handler/checkAnswered",
        { userID: props.uid, formID: props.formID, formType: props.formType },
        true
    );

    const [submitResponse, submitForm] = useDynamicFetch<
        undefined,
        {
            userID: string;
            userResponse: string;
            formID: string;
        }
    >("/response-handler/answerShortAnswer", undefined, false);

    const submit = async (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        setSubmitting(true);
        await submitForm({
            userID: props.uid,
            userResponse: userResponse,
            formID: props.formID,
        });
        props.sock.emit(ResponseFormEvent.NEW_RESPONSE, props.sid);
        setTimeout(() => {
            props.back();
        }, 1000);
    };

    if (!requestIsLoaded(userAnswered)) {
        return <Loader />;
    }

    return (
        <div>
            {userAnswered.data.found && (
                <Alert variant="danger">You have already answered</Alert>
            )}

            <Form
                className="mt-3 mb-3"
                onSubmit={(e) => {
                    submit(e);
                }}
            >
                <h1>{props.question}</h1>
                <Form.Label>Your response</Form.Label>
                <Form.Control
                    as="textarea"
                    className="mb-3"
                    onChange={(e) => {
                        setUserResponse(e.target.value);
                    }}
                    disabled={userAnswered.data.found || submitting}
                />
                <ButtonWithLoadingProp
                    type="submit"
                    disabled={userAnswered.data.found || submitting}
                    invertLoader
                    loading={requestIsLoading(submitResponse)}
                >
                    Submit
                </ButtonWithLoadingProp>
                <Button
                    variant="secondary"
                    onClick={() => {
                        props.back();
                    }}
                >
                    Back
                </Button>
            </Form>
            {requestIsLoaded(submitResponse) && (
                <Alert variant="success">Successfully answered</Alert>
            )}
        </div>
    );
};
