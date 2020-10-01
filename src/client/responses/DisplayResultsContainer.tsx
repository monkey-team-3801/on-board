import React from "react";
import { Button } from "react-bootstrap";
import { ResponseFormType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { ShortAnswerDisplayContainer } from "./ShortAnswerDisplayContainer";

type Props = {
    formID: string;
    formType: ResponseFormType;
    back: Function;
};

export const DisplayResultsContainer = (props: Props) => {
    const [mcResultsData] = useDynamicFetch<
        Array<Array<string>>,
        { formID: string }
    >(
        "/response-handler/getMCResults",
        { formID: props.formID },
        props.formType === ResponseFormType.MULTIPLE_CHOICE
    );

    const [saResultsData] = useDynamicFetch<
        Array<Array<string>>,
        { formID: string }
    >(
        "/response-handler/getSAResults",
        { formID: props.formID },
        props.formType === ResponseFormType.SHORT_ANSWER
    );

    if (!requestIsLoaded(mcResultsData) || !requestIsLoaded(saResultsData)) {
        return <div>loading...</div>;
    }

    let options: Array<string> = [];
    let values: Array<string> = [];
    let saValues: Array<Array<string>> = [];

    if (props.formType === ResponseFormType.MULTIPLE_CHOICE) {
        values = mcResultsData.data[0];
        options = mcResultsData.data[1];
    } else {
        saValues = saResultsData.data;
    }

    return (
        <div>
            <Button
                onClick={() => {
                    props.back(0);
                }}
            >
                Back
            </Button>
            {props.formType === ResponseFormType.MULTIPLE_CHOICE &&
                options.map((x, i) => (
                    <div key={i}>
                        <div>
                            {x}: {values[i]}
                        </div>
                    </div>
                ))}
            {props.formType === ResponseFormType.SHORT_ANSWER &&
                saValues.map((x, i) => (
                    <div key={i}>
                        <ShortAnswerDisplayContainer user={x[0]} text={x[1]} />
                    </div>
                ))}
        </div>
    );
};
