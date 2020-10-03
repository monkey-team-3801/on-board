import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { ResponseFormType, UserType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { DisplayResultsContainer } from "./DisplayResultsContainer";
import { MultipleChoiceDisplay } from "./MultipleChoiceDisplay";
import { ShortAnswerDisplay } from "./ShortAnswerDisplay";

type Props = {
    sessionID: string;
    uid: string;
    userType: UserType;
    sock: SocketIOClient.Socket;
};

export const DisplayContainer = (props: Props) => {
    const [forms, getForms] = useDynamicFetch<
        { MC: Array<Array<string>>; SA: Array<Array<string>> },
        { sid: string }
    >("/response-handler/getFormsBySession", { sid: props.sessionID }, true);

    const [displayStage, setDisplayStage] = React.useState<number>(0);
    const [formID, setFormID] = React.useState<string>("");
    const [formType, setFormType] = React.useState<ResponseFormType>(
        ResponseFormType.MULTIPLE_CHOICE
    );
    const [displayQuestion, setQuestion] = React.useState<string>("");

    const [data, setData] = React.useState<{
        MC: Array<Array<string>>;
        SA: Array<Array<string>>;
    }>({ MC: [], SA: [] });

    const updateForms = React.useCallback(() => {
        getForms({ sid: props.sessionID });
    }, [getForms, props.sessionID]);

    React.useEffect(() => {
        props.sock.on(ResponseFormEvent.NEW_FORM, updateForms);
        return () => {
            props.sock.off(ResponseFormEvent.NEW_FORM, updateForms);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (requestIsLoaded(forms)) {
            setData(forms.data);
        }
    }, [forms]);

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
                    data.MC.map((dataPair, index) => (
                        <div key={index}>
                            <div style={{ display: "inline" }}>
                                {dataPair[1]}
                            </div>
                            <ButtonGroup style={{ float: "right" }}>
                                {props.userType === UserType.STUDENT && (
                                    <Button
                                        onClick={() => {
                                            displayForm(
                                                dataPair[0],
                                                ResponseFormType.MULTIPLE_CHOICE,
                                                dataPair[1]
                                            );
                                        }}
                                        size="sm"
                                    >
                                        Answer
                                    </Button>
                                )}
                                {props.userType !== UserType.STUDENT && (
                                    <Button
                                        onClick={() => {
                                            displayResults(
                                                dataPair[0],
                                                ResponseFormType.MULTIPLE_CHOICE
                                            );
                                        }}
                                        size="sm"
                                    >
                                        View results
                                    </Button>
                                )}
                            </ButtonGroup>
                            <br></br>
                            <br></br>
                        </div>
                    ))}
                <br></br>
                {displayStage === 0 && <h4>Short Answer Forms:</h4>}
                {displayStage === 0 &&
                    data.SA.map((dataPair, index) => (
                        <div key={index}>
                            <div style={{ display: "inline" }}>
                                {dataPair[1]}
                            </div>
                            <ButtonGroup style={{ float: "right" }}>
                                {props.userType === UserType.STUDENT && (
                                    <Button
                                        onClick={() => {
                                            displayForm(
                                                dataPair[0],
                                                ResponseFormType.SHORT_ANSWER,
                                                dataPair[1]
                                            );
                                        }}
                                        size="sm"
                                    >
                                        Answer
                                    </Button>
                                )}
                                {props.userType !== UserType.STUDENT && (
                                    <Button
                                        onClick={() => {
                                            displayResults(
                                                dataPair[0],
                                                ResponseFormType.SHORT_ANSWER
                                            );
                                        }}
                                        size="sm"
                                    >
                                        View responses
                                    </Button>
                                )}
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
                            question={displayQuestion}
                            back={setDisplayStage}
                            uid={props.uid}
                            sock={props.sock}
                            sid={props.sessionID}
                            formType={ResponseFormType.MULTIPLE_CHOICE}
                        />
                    )}
            </div>
            <div>
                {displayStage === 1 &&
                    formType === ResponseFormType.SHORT_ANSWER && (
                        <ShortAnswerDisplay
                            formID={formID}
                            question={displayQuestion}
                            uid={props.uid}
                            back={setDisplayStage}
                            sock={props.sock}
                            sid={props.sessionID}
                            formType={ResponseFormType.SHORT_ANSWER}
                        />
                    )}
            </div>
            <div>
                {displayStage === 2 && (
                    <DisplayResultsContainer
                        formID={formID}
                        formType={formType}
                        back={setDisplayStage}
                        sock={props.sock}
                    />
                )}
            </div>
        </div>
    );
};
