import { useThrottleCallback } from "@react-hook/throttle";
import React from "react";
import { Button, Container } from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { ResponseFormType } from "../../types";
import { Loader } from "../components";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { MultipleChoiceResultsChart } from "./MultipleChoiceResultsChart";

type Props = {
    formData: {
        formID: string;
        question: string;
        formType: ResponseFormType;
    };
    back: () => void;
    sock: SocketIOClient.Socket;
};

export const DisplayResultsContainer = (props: Props) => {
    const { formID, formType } = props.formData;
    const [mcResultsData, getMcResults] = useDynamicFetch<
        Array<Array<string>>,
        { formID: string }
    >(
        "/response-handler/getMCResults",
        { formID },
        formType === ResponseFormType.MULTIPLE_CHOICE
    );

    const [saResultsData, getSaResults] = useDynamicFetch<
        Array<Array<string>>,
        { formID: string }
    >(
        "/response-handler/getSAResults",
        { formID },
        formType === ResponseFormType.SHORT_ANSWER
    );

    const [shortAnswerData, setShortAnswerData] = React.useState<
        Array<Array<string>>
    >([]);
    const [multipleChoiceData, setMultipleChoiceData] = React.useState<
        Array<Array<string>>
    >([]);

    const throttleFetchMc = useThrottleCallback(
        () => {
            getMcResults({ formID });
        },
        1,
        true
    );

    const throttleFetchSa = useThrottleCallback(
        () => {
            getSaResults({ formID });
        },
        1,
        true
    );

    const updateResponses = React.useCallback(() => {
        if (formType === ResponseFormType.MULTIPLE_CHOICE) {
            throttleFetchMc();
        } else {
            throttleFetchSa();
        }
    }, [formType, throttleFetchMc, throttleFetchSa]);

    React.useEffect(() => {
        props.sock.on(ResponseFormEvent.NEW_RESPONSE, updateResponses);
        return () => {
            props.sock.off(ResponseFormEvent.NEW_RESPONSE, updateResponses);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (formType === ResponseFormType.MULTIPLE_CHOICE) {
            if (requestIsLoaded(mcResultsData)) {
                setMultipleChoiceData(mcResultsData.data);
            }
        }
        if (formType === ResponseFormType.SHORT_ANSWER) {
            if (requestIsLoaded(saResultsData)) {
                setShortAnswerData(saResultsData.data);
            }
        }
    }, [
        mcResultsData,
        saResultsData,
        formType,
        setMultipleChoiceData,
        setShortAnswerData,
    ]);

    if (
        formType === ResponseFormType.MULTIPLE_CHOICE &&
        !requestIsLoaded(mcResultsData)
    ) {
        return <Loader className="pt-4 pb-4" />;
    }

    if (
        formType === ResponseFormType.SHORT_ANSWER &&
        !requestIsLoaded(saResultsData)
    ) {
        return <Loader className="pt-4 pb-4" />;
    }

    // TODO: Consider splitting this file up into seperate ones.
    const values =
        formType === ResponseFormType.MULTIPLE_CHOICE
            ? multipleChoiceData[0]
            : undefined;
    const options =
        formType === ResponseFormType.MULTIPLE_CHOICE
            ? multipleChoiceData[1]
            : undefined;
    const saValues =
        formType === ResponseFormType.SHORT_ANSWER
            ? shortAnswerData
            : undefined;

    return (
        <Container>
            <h1>{props.formData.question}</h1>
            {formType === ResponseFormType.MULTIPLE_CHOICE && options && (
                <MultipleChoiceResultsChart
                    data={options.map((option, i) => {
                        return { name: option, value: Number(values?.[i]) };
                    })}
                />
            )}
            <Button
                onClick={() => {
                    props.back();
                }}
                size="sm"
                className="mt-4"
            >
                Back
            </Button>
        </Container>
    );
};
