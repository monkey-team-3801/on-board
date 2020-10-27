import { OrderedMap } from "immutable";
import React from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { ResponseFormEvent } from "../../events";
import { ButtonWithLoadingProp } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded, requestIsLoading } from "../utils";

type Props = {
    // Question title.
    question: string;
    // Current session id.
    sessionID: string;
    // Closes the current modal.
    closeModal: () => void;
    // Current user id.
    uid: string;
    // Current socket instance.
    sock: SocketIOClient.Socket;
    // Setter for form submitting status.
    setFormSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    // State to check if the form is being submitted.
    formSubmitting: boolean;
};

/**
 * Form for creating a multiple choice question.
 */
export const MultipleChoiceContainer = (props: Props) => {
    const initialValues: [string, string][] = [[uuidv4(), ""]];
    const initialMap = OrderedMap<string, string>(initialValues);
    const [options, setOptions] = React.useState<OrderedMap<string, string>>(
        initialMap
    );

    const [uploadFormResponse, uploadForm] = useDynamicFetch<
        undefined,
        {
            options: { [key: string]: string };
            question: string;
            sessionID: string;
            userID: string;
        }
    >("/response-handler/submitMcForm", undefined, false);

    const submitForm = async (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        props.setFormSubmitting(true);
        const data = {
            options: options.toObject(),
            question: props.question,
            sessionID: props.sessionID,
            userID: props.uid,
        };
        await uploadForm(data);
        props.sock.emit(ResponseFormEvent.NEW_FORM, props.sessionID);
        setTimeout(() => {
            props.closeModal();
        }, 1000);
    };

    return (
        <>
            <Form onSubmit={submitForm} className="mb-3">
                <Form.Group>
                    <Button
                        disabled={
                            options.size > 5 ||
                            requestIsLoading(uploadFormResponse) ||
                            props.formSubmitting
                        }
                        onClick={() => {
                            const key = uuidv4();
                            setOptions(options.set(key, ""));
                        }}
                        className="btn-secondary mt-2"
                        size="sm"
                    >
                        Add Option
                    </Button>
                </Form.Group>

                {Array.from(options.entries()).map(([key, value], i) => {
                    return (
                        <Form.Group key={key}>
                            <Input
                                optionKey={key}
                                index={i}
                                value={value}
                                onChange={(key, value) => {
                                    setOptions(options.set(key, value));
                                }}
                                onDelete={(key) => {
                                    setOptions(options.delete(key));
                                }}
                                disabled={props.formSubmitting}
                            />
                        </Form.Group>
                    );
                })}
                <ButtonWithLoadingProp
                    type="submit"
                    disabled={props.question === "" || props.formSubmitting}
                    invertLoader
                    loading={requestIsLoading(uploadFormResponse)}
                >
                    Submit
                </ButtonWithLoadingProp>
            </Form>
            {requestIsLoaded(uploadFormResponse) && (
                <Alert variant="success">
                    Successfully created question form
                </Alert>
            )}
        </>
    );
};

const Input = ({
    optionKey,
    value,
    index,
    onDelete,
    onChange,
    disabled,
}: {
    optionKey: string;
    value: string;
    index: number;
    onDelete: (key: string) => void;
    onChange: (key: string, value: string) => void;
    disabled: boolean;
}) => {
    return (
        <div style={{ display: "block " }}>
            <Form.Label>Option {index + 1}</Form.Label>

            {index >= 1 && (
                <Button
                    onClick={() => {
                        onDelete(optionKey);
                    }}
                    size="sm"
                    variant="danger"
                    className="ml-4"
                    disabled={disabled}
                >
                    Delete
                </Button>
            )}
            <Form.Control
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(optionKey, e.target.value);
                }}
                required
                disabled={disabled}
            />
        </div>
    );
};
