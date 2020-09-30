import React from "react";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    sessionID: string;
};
export const DisplayContainer = (props: Props) => {
    const [forms, getForms] = useDynamicFetch<
        Array<Array<string>>,
        { sid: string }
    >("/response-handler/getFormsBySession", { sid: props.sessionID }, true);

    if (!requestIsLoaded(forms)) {
        return <div>loading forms...</div>;
    }

    const MultipleChoiceForms = forms.data[0];
    const ShortAnswerForms = forms.data[1];

    const test = () => {
        getForms({
            sid: props.sessionID,
        });
        console.log(ShortAnswerForms);
    };

    return (
        <div>
            <button
                onClick={() => {
                    test();
                }}
            >
                click
            </button>
        </div>
    );
};
