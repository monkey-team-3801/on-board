import { useThrottleCallback } from "@react-hook/throttle";
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

    const throttleFetchMc = useThrottleCallback(
        () => {
            getMcResults({ formID: props.formID });
        },
        1,
        true
    );

    const throttleFetchSa = useThrottleCallback(
        () => {
            getSaResults({ formID: props.formID });
        },
        1,
        true
    );

    const updateResponses = React.useCallback(() => {
        if (props.formType === ResponseFormType.MULTIPLE_CHOICE) {
            throttleFetchMc();
        } else {
            throttleFetchSa();
        }
    }, [props.formType, throttleFetchMc, throttleFetchSa]);

    React.useEffect(() => {
        props.sock.on(ResponseFormEvent.NEW_RESPONSE, updateResponses);
        return () => {
            props.sock.off(ResponseFormEvent.NEW_RESPONSE, updateResponses);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    }, [
        mcResultsData,
        saResultsData,
        props.formType,
        setMultipleChoiceData,
        setShortAnswerData,
    ]);

    // TODO: Consider splitting this file up into seperate ones.
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
