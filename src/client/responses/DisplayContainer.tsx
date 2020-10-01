import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { ResponseFormType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { MultipleChoiceDisplay } from "./MultipleChoiceDisplay";
import { ShortAnswerDisplay } from "./ShortAnswerDisplay";

type Props = {
    sessionID: string;
};
export const DisplayContainer = (props: Props) => {
    const [forms, getForms] = useDynamicFetch<
        { [formType: string]: Array<Array<string>> },
        { sid: string }
    >("/response-handler/getFormsBySession", { sid: props.sessionID }, true);
    const [displayStage, setDisplayStage] = React.useState<number>(0);
    const [formID, setFormID] = React.useState<string>("");
    const [formType, setFormType] = React.useState<ResponseFormType>();

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

    const displayForm = (id: string, type: ResponseFormType) => {
        setFormID(id);
        setFormType(type);
        setDisplayStage(1);
    };

    return (
        <div>
            <div>
                {displayStage === 0 && <div>Multiple Choice Forms:</div>}
                {displayStage === 0 &&
                    MultipleChoiceForms.map((x, i) => (
                        <div key={i}>
                            <ButtonGroup>
                                <div>{x[1]}</div>
                                <Button
                                    onClick={() => {
                                        displayForm(
                                            x[0],
                                            ResponseFormType.MULTIPLE_CHOICE
                                        );
                                    }}
                                >
                                    click
                                </Button>
                            </ButtonGroup>
                        </div>
                    ))}
                {displayStage === 0 && <div>Short Answer Forms:</div>}
                {displayStage === 0 &&
                    ShortAnswerForms.map((x, i) => (
                        <div key={i}>
                            <ButtonGroup>
                                <div>{x[1]}</div>
                                <Button
                                    onClick={() => {
                                        displayForm(
                                            x[0],
                                            ResponseFormType.SHORT_ANSWER
                                        );
                                    }}
                                >
                                    click
                                </Button>
                            </ButtonGroup>
                        </div>
                    ))}
            </div>
            <div>
                {displayStage === 1 &&
                    formType === ResponseFormType.MULTIPLE_CHOICE && (
                        <MultipleChoiceDisplay
                            formID={formID}
                        ></MultipleChoiceDisplay>
                    )}
            </div>
            <div>
                {displayStage === 1 &&
                    formType === ResponseFormType.SHORT_ANSWER && (
                        <ShortAnswerDisplay
                            formID={formID}
                        ></ShortAnswerDisplay>
                    )}
            </div>
        </div>
    );
};
