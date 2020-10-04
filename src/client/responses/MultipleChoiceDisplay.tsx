import React from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { ResponseFormType } from "../../types";
import { Loader } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

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
    const [form] = useDynamicFetch<
        { [optionID: string]: string },
        { formID: string }
    >("/response-handler/getMCFormByID", { formID: props.formID }, true);

    const [, submitForm] = useDynamicFetch<
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

    const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        await submitForm({
            formID: props.formID,
            userID: props.uid,
            option: option,
        });
        props.sock.emit(ResponseFormEvent.NEW_RESPONSE, props.sid);
        props.back();
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
                className="mt-3"
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
                            disabled={userAnswered.data.found}
                        ></Form.Check>
                    ))}
                </Form.Group>

                <Button
                    type="submit"
                    disabled={checked < 0 || userAnswered.data.found}
                >
                    Submit
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => {
                        props.back();
                    }}
                >
                    Back
                </Button>
            </Form>
        </div>
    );
};
