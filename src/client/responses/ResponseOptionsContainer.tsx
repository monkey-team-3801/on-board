import React from "react";
import {
    Alert,
    Container,
    Form,
    FormControl,
    FormGroup,
    InputGroup,
    Alert,
} from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { ResponseFormType } from "../../types";
import { ButtonWithLoadingProp } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded, requestIsLoading } from "../utils";
import { FileResponseOptionsContainer } from "./FileResponseOptionsContainer";
import { MultipleChoiceContainer } from "./MultipleChoiceContainer";

type Props = {
    sid: string;
    userid: string;
    sock: SocketIOClient.Socket;
    closeModal: () => void;
};

export const ResponseOptionsContainer = (props: Props) => {
    const [checkedOption, setOption] = React.useState<ResponseFormType>(
        ResponseFormType.MULTIPLE_CHOICE
    );
    const [question, setQuestion] = React.useState<string>("");
    const [uploadFormResponse, uploadForm] = useDynamicFetch<
        undefined,
        { sessionID: string; question: string; uid: string }
    >("/response-handler/submitSaForm", undefined, false);

    const [formSubmitting, setFormSubmitting] = React.useState<boolean>(false);

    React.useEffect(() => {
        setFormSubmitting(false);
    }, [checkedOption]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormSubmitting(true);
        await uploadForm({
            sessionID: props.sid,
            question: question,
            uid: props.userid,
        });
        props.sock.emit(ResponseFormEvent.NEW_FORM, props.sid);
        setTimeout(() => {
            props.closeModal();
        }, 500);
    };

    return (
        <Container>
            <Form className="mb-3" onSubmit={handleSubmit}>
                <FormGroup>
                    <Form.Row>
                        <Form.Label className="mr-4 mb-0">
                            Question Type:
                        </Form.Label>
                        <Form.Check
                            type={"radio"}
                            label={"Multiple Choice"}
                            inline
                            checked={
                                checkedOption ===
                                ResponseFormType.MULTIPLE_CHOICE
                            }
                            onChange={() => {
                                setOption(ResponseFormType.MULTIPLE_CHOICE);
                            }}
                            disabled={formSubmitting}
                        />
                        <Form.Check
                            type={"radio"}
                            label={"Short Answer"}
                            inline
                            checked={
                                checkedOption === ResponseFormType.SHORT_ANSWER
                            }
                            onChange={() => {
                                setOption(ResponseFormType.SHORT_ANSWER);
                            }}
                            disabled={formSubmitting}
                        />
                        <Form.Check
                            type={"radio"}
                            label={"Collect Files"}
                            inline
                            checked={checkedOption === ResponseFormType.FILE}
                            onChange={() => {
                                setOption(ResponseFormType.FILE);
                            }}
                        />
                    </Form.Row>
                </FormGroup>
                <InputGroup>
                    <FormControl
                        placeholder={
                            checkedOption === ResponseFormType.FILE
                                ? "Title"
                                : "Question"
                        }
                        onChange={(e) => {
                            setQuestion(e.target.value);
                        }}
                        required
                        disabled={formSubmitting}
                    />
                </InputGroup>
                {checkedOption === ResponseFormType.SHORT_ANSWER && (
                    <ButtonWithLoadingProp
                        type="submit"
                        className={"mt-3"}
                        disabled={question === "" || formSubmitting}
                        invertLoader
                        loading={requestIsLoading(uploadFormResponse)}
                    >
                        Submit
                    </ButtonWithLoadingProp>
                )}
                {requestIsLoaded(uploadFormResponse) && (
                    <Alert variant="success">
                        Successfully created question form
                    </Alert>
                )}
            </Form>
            {requestIsLoaded(uploadFormResponse) && (
                <Alert variant="success">
                    Successfully created question form
                </Alert>
            )}
            <div>
                {checkedOption === ResponseFormType.MULTIPLE_CHOICE && (
                    <MultipleChoiceContainer
                        question={question}
                        sessionID={props.sid}
                        closeModal={props.closeModal}
                        uid={props.userid}
                        sock={props.sock}
                        setFormSubmitting={setFormSubmitting}
                        formSubmitting={formSubmitting}
                    />
                )}
                {checkedOption === ResponseFormType.FILE && (
                    <FileResponseOptionsContainer
                        question={question}
                        sessionID={props.sid}
                        closeModal={props.closeModal}
                        uid={props.userid}
                        sock={props.sock}
                    />
                )}
            </div>
        </Container>
    );
};
