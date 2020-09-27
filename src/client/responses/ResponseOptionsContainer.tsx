import React from "react";
import {
    Button,
    Form,
    FormControl,
    FormGroup,
    InputGroup,
} from "react-bootstrap";
import { MultipleChoiceContainer } from "./MultipleChoiceContainer";

export const ResponseOptionsContainer = () => {
    const [checkedOption, setOption] = React.useState<string>("mc");
    const [question, setQuestion] = React.useState<string>("");

    const test = (option: string) => {
        console.log("test");
        setOption(option);
    };

    return (
        <div>
            <h1>response options container</h1>
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
                    <MultipleChoiceContainer q={question} />
                ) : (
                    <Button type="submit">Submit</Button>
                )}
            </div>
        </div>
    );
};
