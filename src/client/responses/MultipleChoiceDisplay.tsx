import React from "react";
import { Button, Form } from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    formID: string;
    q: string;
    back: Function;
    uid: string;
    sock: SocketIOClient.Socket;
    sid: string;
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
        { userID: string; formID: string }
    >(
        "/response-handler/checkAnswered",
        { userID: props.uid, formID: props.formID },
        true
    );

    const [checked, setChecked] = React.useState<number>(-1);
    const [option, setOption] = React.useState<string>("");

    if (!requestIsLoaded(form) || !requestIsLoaded(userAnswered)) {
        return <div>loading...</div>;
    }

    const data = form.data;

    const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        await submitForm({
            formID: props.formID,
            userID: props.uid,
            option: option,
        });
        props.sock.emit(ResponseFormEvent.NEW_RESPONSE, props.sid);
        props.back(0);
    };

    const handleCheck = (hash: string, index: number) => {
        setOption(hash.toString());
        setChecked(index);
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
            <Form
                onSubmit={(e) => {
                    handleSubmit(e);
                }}
            >
                <h1>{props.q}</h1>
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
                {!userAnswered.data.found && (
                    <Button type="submit" disabled={checked < 0}>
                        submit
                    </Button>
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
