import React from "react";
import {
    Button,
    Form,
    FormControl,
    FormGroup,
    InputGroup,
} from "react-bootstrap";
import { MultipleChoiceContainer } from "./MultipleChoiceContainer";

type Props = {
    sid: string;
    closeFunc: Function;
};

export const ResponseOptionsContainer = (props: Props) => {
    const [checkedOption, setOption] = React.useState<string>("mc");
    const [question, setQuestion] = React.useState<string>("");

    const test = (option: string) => {
        console.log("test");
        setOption(option);
    };

    return (
        <div>
            <h1>response options container test</h1>
            <Form>
                <FormGroup>
                    <Form.Check
                        type={"radio"}
                        label={"Multiple Choice"}
                        inline
                        checked={checkedOption === "mc"}
                        onChange={() => {
                            setOption("mc");
                        }}
                    />
                    <Form.Check
                        type={"radio"}
                        label={"Short Answer"}
                        inline
                        checked={checkedOption === "sa"}
                        onChange={() => {
                            setOption("sa");
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
            <div>
                {checkedOption === "mc" ? (
                    <MultipleChoiceContainer
                        question={question}
                        sessionID={props.sid}
                        closeModal={props.closeFunc}
                    />
                ) : (
                    <Button
                        type="submit"
                        onClick={() => {
                            props.closeFunc();
                        }}
                    >
                        Submit
                    </Button>
                )}
            </div>
        </div>
    );
};
