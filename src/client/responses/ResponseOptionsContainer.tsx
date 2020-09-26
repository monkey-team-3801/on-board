import React from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import { MultipleChoiceContainer } from "./MultipleChoiceContainer";
import { ShortAnswerContainer } from "./ShortAnswerContainer";

export const ResponseOptionsContainer = () => {
    const [checkedOption, setOption] = React.useState<string>("mc");
    const [question, setQuestion] = React.useState<string>("");

    const test = (option: string) => {
        console.log("test");
        setOption(option);
    };

    // TODO: Use radio buttons from bootstrap
    return (
        <div>
            <h1>response options container</h1>
            <input
                type="radio"
                value="Multiple Choice"
                name="formType"
                onChange={(e) => {
                    setOption("mc");
                }}
                checked={checkedOption === "mc"}
            />
            &nbsp; Multiple Choice &nbsp;&nbsp;&nbsp;
            <input
                type="radio"
                value="Short Answer"
                name="formType"
                onChange={(e) => {
                    setOption("sa");
                }}
                checked={checkedOption === "sa"}
            />
            &nbsp; Short Answer
            <br></br>
            <br></br>
            <InputGroup>
                <FormControl
                    placeholder="Question"
                    onChange={(e) => {
                        setQuestion(e.target.value);
                    }}
                />
            </InputGroup>
            <div>
                {checkedOption === "mc" ? (
                    <MultipleChoiceContainer q={question} />
                ) : (
                    <ShortAnswerContainer q={question} />
                )}
            </div>
        </div>
    );
};
