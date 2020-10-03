import React from "react";
import {
    Button,
    Form,
    FormControl,
    FormGroup,
    InputGroup,
} from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { ResponseFormType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { MultipleChoiceContainer } from "./MultipleChoiceContainer";

type Props = {
    sid: string;
    closeFunc: Function;
    userid: string;
    sock: SocketIOClient.Socket;
};

export const ResponseOptionsContainer = (props: Props) => {
    const [checkedOption, setOption] = React.useState<ResponseFormType>(
        ResponseFormType.MULTIPLE_CHOICE
    );
    const [question, setQuestion] = React.useState<string>("");
    const [, uploadForm] = useDynamicFetch<
        undefined,
        { [key: string]: string }
    >("/response-handler/submitSaForm", undefined, false);

    const handleSubmit = async () => {
        await uploadForm({
            sessionID: props.sid,
            question: question,
            uid: props.userid,
        });
        props.sock.emit(ResponseFormEvent.NEW_FORM, props.sid);
        props.closeFunc(false);
    };

    return (
        <div>
            <Form>
                <FormGroup>
                    <Form.Check
                        type={"radio"}
                        label={"Multiple Choice"}
                        inline
                        checked={
                            checkedOption === ResponseFormType.MULTIPLE_CHOICE
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
                </FormGroup>
            </Form>
            <InputGroup>
                <FormControl
                    placeholder="Question"
                    onChange={(e) => {
                        setQuestion(e.target.value);
                    }}
                    required={true}
                />
            </InputGroup>
            <br></br>
            <div>
                {checkedOption === ResponseFormType.MULTIPLE_CHOICE ? (
                    <MultipleChoiceContainer
                        question={question}
                        sessionID={props.sid}
                        closeModal={props.closeFunc}
                        uid={props.userid}
                        sock={props.sock}
                    />
                ) : (
                    <Button
                        type="submit"
                        onClick={() => {
                            handleSubmit();
                        }}
                        disabled={!question}
                    >
                        Submit
                    </Button>
                )}
                {question ? null : (
                    <div style={{ color: "red" }}>
                        please fill out the question field.
                    </div>
                )}
            </div>
        </div>
    );
};
