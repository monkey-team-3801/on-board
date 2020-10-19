import React from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { ResponseFormType } from "../../types";
import { Loader, ButtonWithLoadingProp } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded, requestIsLoading } from "../utils";

type Props = {
    formID: string;
    question: string;
    back: () => void;
    uid: string;
    sock: SocketIOClient.Socket;
    sid: string;
    formType: ResponseFormType;
};

export const MultipleChoiceDisplay = (props: Props) => {
    const { formID } = props;
    const [form] = useDynamicFetch<
        { [optionID: string]: string },
        { formID: string }
    >("/response-handler/getMCFormByID", { formID: props.formID }, true);

    const [submitResponse, submitForm] = useDynamicFetch<
        undefined,
        { formID: string; userID: string; option: string }
    >("/response-handler/answerMultipleChoice", undefined, false);

    const [userAnswered] = useDynamicFetch<
        { found: boolean },
        { userID: string; formID: string; formType: ResponseFormType }
    >(
        "/response-handler/checkAnswered",
        { userID: props.uid, formID: props.formID, formType: props.formType },
        true
    );

    const [checked, setChecked] = React.useState<number>(-1);
    const [option, setOption] = React.useState<string>("");

    const [submitting, setSubmitting] = React.useState<boolean>(false);

    React.useEffect(() => {
        setSubmitting(false);
    }, [formID]);

    const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        setSubmitting(true);
        await submitForm({
            formID: props.formID,
            userID: props.uid,
            option: option,
        });
        props.sock.emit(ResponseFormEvent.NEW_RESPONSE, props.sid);
        setTimeout(() => {
            props.back();
        }, 1000);
    };

    const handleCheck = (hash: string, index: number) => {
        setOption(hash.toString());
        setChecked(index);
    };

    if (!requestIsLoaded(form) || !requestIsLoaded(userAnswered)) {
        return <Loader />;
    }

    const data = form.data;

    return (
        <div>
            {userAnswered.data.found && (
                <Alert variant="danger">You have already answered</Alert>
            )}
            <Form
                className="mt-3 mb-3"
                onSubmit={(e) => {
                    handleSubmit(e);
                }}
            >
                <h1>{props.question}</h1>
                <Form.Group>
                    {Object.keys(data).map((x, i) => (
                        <Form.Check
                            key={i}
                            type={"radio"}
                            label={data[x]}
                            checked={checked === i}
                            onChange={() => {
                                handleCheck(x, i);
                            }}
                            className="py-2"
                            disabled={userAnswered.data.found || submitting}
                        ></Form.Check>
                    ))}
                </Form.Group>

                <ButtonWithLoadingProp
                    type="submit"
                    disabled={
                        checked < 0 || userAnswered.data.found || submitting
                    }
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
                <Alert variant="success">Successfully submitted response</Alert>
            )}
        </div>
    );
};
