import React from "react";
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

    if (!requestIsLoaded(forms)) {
        return <div>loading forms...</div>;
    }

    const MultipleChoiceForms = forms.data.MC;
    const ShortAnswerForms = forms.data.SA;

    console.log(MultipleChoiceForms);
    console.log(ShortAnswerForms);

    // const test = () => {
    //     getForms({
    //         sid: props.sessionID,
    //     });
    //     console.log(ShortAnswerForms);
    // };

    return (
        <div>
            <div>Multiple Choice Forms:</div>
            <div>
                {MultipleChoiceForms.map((x, i) => (
                    <div key={i}>
                        <MultipleChoiceDisplay formID={x[0]} />
                        <p>{x[1]}</p>
                    </div>
                ))}
            </div>
            <div>Short Answer Forms:</div>
            <div>
                {ShortAnswerForms.map((x, i) => (
                    <div key={i}>
                        <ShortAnswerDisplay formID={x[0]} />
                        <p>{x[1]}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
