import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { ResponseFormType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { DisplayResultsContainer } from "./DisplayResultsContainer";
import { MultipleChoiceDisplay } from "./MultipleChoiceDisplay";
import { ShortAnswerDisplay } from "./ShortAnswerDisplay";

type Props = {
    sessionID: string;
    uid: string;
};
export const DisplayContainer = (props: Props) => {
    const [forms, getForms] = useDynamicFetch<
        { [formType: string]: Array<Array<string>> },
        { sid: string }
    >("/response-handler/getFormsBySession", { sid: props.sessionID }, true);

    const [displayStage, setDisplayStage] = React.useState<number>(0);
    const [formID, setFormID] = React.useState<string>("");
    const [formType, setFormType] = React.useState<ResponseFormType>(
        ResponseFormType.MULTIPLE_CHOICE
    );
    const [displayQuestion, setQuestion] = React.useState<string>("");

    if (!requestIsLoaded(forms)) {
        return <div>loading forms...</div>;
    }

    const MultipleChoiceForms = forms.data.MC;
    const ShortAnswerForms = forms.data.SA;

    const updateForms = () => {
        getForms({
            sid: props.sessionID,
        });
    };

    const displayForm = (
        id: string,
        type: ResponseFormType,
        question: string
    ) => {
        setFormID(id);
        setFormType(type);
        setDisplayStage(1);
        setQuestion(question);
    };

    const displayResults = (id: string, type: ResponseFormType) => {
        setDisplayStage(2);
        setFormID(id);
        setFormType(type);
    };

    return (
        <div>
            <div>
                {displayStage === 0 && <h4>Multiple Choice Forms:</h4>}
                {displayStage === 0 &&
                    MultipleChoiceForms.map((x, i) => (
                        <div key={i}>
                            <div style={{ display: "inline" }}>{x[1]}</div>
                            <ButtonGroup style={{ float: "right" }}>
                                <Button
                                    onClick={() => {
                                        displayForm(
                                            x[0],
                                            ResponseFormType.MULTIPLE_CHOICE,
                                            x[1]
                                        );
                                    }}
                                    size="sm"
                                >
                                    Answer
                                </Button>
                                <Button
                                    onClick={() => {
                                        displayResults(
                                            x[0],
                                            ResponseFormType.MULTIPLE_CHOICE
                                        );
                                    }}
                                    size="sm"
                                >
                                    View results
                                </Button>
                            </ButtonGroup>
                            <br></br>
                            <br></br>
                        </div>
                    ))}
                <br></br>
                {displayStage === 0 && <h4>Short Answer Forms:</h4>}
                {displayStage === 0 &&
                    ShortAnswerForms.map((x, i) => (
                        <div key={i}>
                            <div style={{ display: "inline" }}>{x[1]}</div>
                            <ButtonGroup style={{ float: "right" }}>
                                <Button
                                    onClick={() => {
                                        displayForm(
                                            x[0],
                                            ResponseFormType.SHORT_ANSWER,
                                            x[1]
                                        );
                                    }}
                                    size="sm"
                                >
                                    Answer
                                </Button>
                                <Button
                                    onClick={() => {
                                        displayResults(
                                            x[0],
                                            ResponseFormType.SHORT_ANSWER
                                        );
                                    }}
                                    size="sm"
                                >
                                    View responses
                                </Button>
                            </ButtonGroup>
                            <br></br>
                            <br></br>
                        </div>
                    ))}
            </div>
            <div>
                {displayStage === 1 &&
                    formType === ResponseFormType.MULTIPLE_CHOICE && (
                        <MultipleChoiceDisplay
                            formID={formID}
                            q={displayQuestion}
                            back={setDisplayStage}
                            uid={props.uid}
                        />
                    )}
            </div>
            <div>
                {displayStage === 1 &&
                    formType === ResponseFormType.SHORT_ANSWER && (
                        <ShortAnswerDisplay
                            formID={formID}
                            q={displayQuestion}
                            uid={props.uid}
                            back={setDisplayStage}
                        />
                    )}
            </div>
            <div>
                {displayStage === 2 && (
                    <DisplayResultsContainer
                        formID={formID}
                        formType={formType}
                        back={setDisplayStage}
                    />
                )}
            </div>
        </div>
    );
};
