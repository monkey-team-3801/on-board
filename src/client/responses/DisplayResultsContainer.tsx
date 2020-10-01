import React from "react";
import { Button } from "react-bootstrap";
import { ResponseFormType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    formID: string;
    formType: ResponseFormType;
    back: Function;
};

export const DisplayResultsContainer = (props: Props) => {
    const [resultsData] = useDynamicFetch<
        Array<Array<string>>,
        { formID: string; formType: ResponseFormType }
    >(
        "/response-handler/getResults",
        { formID: props.formID, formType: props.formType },
        true
    );

    if (!requestIsLoaded(resultsData)) {
        return <div>loading...</div>;
    }

    const values = resultsData.data[0];
    const options = resultsData.data[1];

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
            {props.formType === ResponseFormType.SHORT_ANSWER && (
                <div>Short answer</div>
            )}
        </div>
    );
};
