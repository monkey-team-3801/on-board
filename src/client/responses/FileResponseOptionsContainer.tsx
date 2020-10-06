import React from "react";
import { Alert, Form } from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { ButtonWithLoadingProp } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded, requestIsLoading } from "../utils";

type Props = {
    question: string;
    sessionID: string;
    closeModal: () => void;
    uid: string;
    sock: SocketIOClient.Socket;
};

export const FileResponseOptionsContainer = (props: Props) => {
    const [uploadFormResponse, submitForm] = useDynamicFetch<
        undefined,
        { sid: string; uid: string; question: string; desc: string }
    >("/response-handler/submitFileForm", undefined, false);

    const [description, setDescription] = React.useState<string>("");

    const [formSubmitting, setFormSubmitting] = React.useState<boolean>(false);

    React.useEffect(() => {
        setFormSubmitting(false);
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        setFormSubmitting(true);
        await submitForm({
            sid: props.sessionID,
            uid: props.uid,
            question: props.question,
            desc: description,
        });

        props.sock.emit(ResponseFormEvent.NEW_FORM, props.sessionID);
        setTimeout(() => {
            props.closeModal();
        }, 1000);
    };

    return (
        <div>
            <Form
                onSubmit={(e) => {
                    handleSubmit(e);
                }}
            >
                <Form.Group>
                    <Form.Label>Add a description (optional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        type="text"
                        placeholder="Description..."
                        onChange={(e) => {
                            setDescription(e.target.value);
                        }}
                    />
                </Form.Group>
                <ButtonWithLoadingProp
                    type="submit"
                    disabled={props.question === "" || formSubmitting}
                    invertLoader
                    loading={requestIsLoading(uploadFormResponse)}
                >
                    Submit
                </ButtonWithLoadingProp>
            </Form>
            {requestIsLoaded(uploadFormResponse) && (
                <Alert variant="success">Successfully created file form</Alert>
            )}
        </div>
    );
};
