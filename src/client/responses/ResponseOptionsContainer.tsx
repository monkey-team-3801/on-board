import React from "react";
import {
    Container,
    Form,
    FormControl,
    FormGroup,
    InputGroup,
} from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { ResponseFormType } from "../../types";
import { ButtonWithLoadingProp } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestIsLoading } from "../utils";
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

    const handleSubmit = async () => {
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
            <Form onSubmit={handleSubmit}>
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
                    />
                </InputGroup>
                {checkedOption === ResponseFormType.SHORT_ANSWER && (
                    <ButtonWithLoadingProp
                        type="submit"
                        className={"mt-2"}
                        disabled={question === ""}
                        invertLoader
                        loading={requestIsLoading(uploadFormResponse)}
                    >
                        Submit
                    </ButtonWithLoadingProp>
                )}
            </Form>

            <div>
                {checkedOption === ResponseFormType.MULTIPLE_CHOICE && (
                    <MultipleChoiceContainer
                        question={question}
                        sessionID={props.sid}
                        closeModal={props.closeModal}
                        uid={props.userid}
                        sock={props.sock}
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
