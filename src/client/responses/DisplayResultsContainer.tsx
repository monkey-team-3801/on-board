import React from "react";
import { Button } from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { ResponseFormType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { ShortAnswerDisplayContainer } from "./ShortAnswerDisplayContainer";

type Props = {
    formID: string;
    formType: ResponseFormType;
    back: Function;
    sock: SocketIOClient.Socket;
};

export const DisplayResultsContainer = (props: Props) => {
    const [mcResultsData, getMcResults] = useDynamicFetch<
        Array<Array<string>>,
        { formID: string }
    >(
        "/response-handler/getMCResults",
        { formID: props.formID },
        props.formType === ResponseFormType.MULTIPLE_CHOICE
    );

    const [saResultsData, getSaResults] = useDynamicFetch<
        Array<Array<string>>,
        { formID: string }
    >(
        "/response-handler/getSAResults",
        { formID: props.formID },
        props.formType === ResponseFormType.SHORT_ANSWER
    );

    const [shortAnswerData, setShortAnswerData] = React.useState<
        Array<Array<string>>
    >([]);
    const [multipleChoiceData, setMultipleChoiceData] = React.useState<
        Array<Array<string>>
    >([]);

    props.sock.on(ResponseFormEvent.NEW_RESPONSE, () => {
        if (props.formType === ResponseFormType.MULTIPLE_CHOICE) {
            getMcResults({ formID: props.formID });
        } else {
            getSaResults({ formID: props.formID });
        }
        props.sock.off(ResponseFormEvent.NEW_RESPONSE);
    });

    React.useEffect(() => {
        if (props.formType === ResponseFormType.MULTIPLE_CHOICE) {
            if (requestIsLoaded(mcResultsData)) {
                setMultipleChoiceData(mcResultsData.data);
            }
        }
        if (props.formType === ResponseFormType.SHORT_ANSWER) {
            if (requestIsLoaded(saResultsData)) {
                setShortAnswerData(saResultsData.data);
            }
        }
    }, [mcResultsData, saResultsData, props.formType]);

    // TODO: Consider splitting this component up into seperate ones.
    const values =
        props.formType === ResponseFormType.MULTIPLE_CHOICE
            ? multipleChoiceData[0]
            : undefined;
    const options =
        props.formType === ResponseFormType.MULTIPLE_CHOICE
            ? multipleChoiceData[1]
            : undefined;
    const saValues =
        props.formType === ResponseFormType.SHORT_ANSWER
            ? shortAnswerData
            : undefined;

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
                options?.map((x, i) => (
                    <div key={i}>
                        <div>
                            {x}: {values?.[i]}
                        </div>
                    </div>
                ))}
            {props.formType === ResponseFormType.SHORT_ANSWER &&
                saValues?.map((x, i) => (
                    <div key={i}>
                        <ShortAnswerDisplayContainer user={x[0]} text={x[1]} />
                    </div>
                ))}
        </div>
    );
};
