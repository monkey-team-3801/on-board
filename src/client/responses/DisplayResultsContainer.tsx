import { useThrottleCallback } from "@react-hook/throttle";
import React from "react";
import { Button, Container } from "react-bootstrap";
import { ResponseFormEvent } from "../../events";
import { FileUploadType, ResponseFormType, RoomType } from "../../types";
import { Loader } from "../components";
import { FileContainer } from "../filehandler/FileContainer";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { MultipleChoiceResultsChart } from "./MultipleChoiceResultsChart";
import { ShortAnswerResultsTable } from "./ShortAnswerResultsTable";

type Props = {
    formData: {
        formID: string;
        question: string;
        formType: ResponseFormType;
    };
    fileContainerData: {
        sessionID: string;
        userID: string;
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

    const [FileResultsData, getFileResults] = useDynamicFetch<
        Array<[string, string, string, string, string]>,
        { formID: string }
    >(
        "/response-handler/getFileResults",
        { formID },
        formType === ResponseFormType.FILE
    );

    const [desc] = useDynamicFetch<{ desc: string }, { formID: string }>(
        "/response-handler/getFileFormDesc",
        { formID: props.formData.formID },
        formType === ResponseFormType.FILE
    );

    const [shortAnswerData, setShortAnswerData] = React.useState<
        Array<Array<string>>
    >([]);
    const [multipleChoiceData, setMultipleChoiceData] = React.useState<
        Array<Array<string>>
    >([]);

    const [fileData, setFileData] = React.useState<
        Array<[string, string, string, string, string]>
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

    const throttleFetchFile = useThrottleCallback(
        () => {
            getFileResults({ formID });
        },
        1,
        true
    );

    const updateResponses = React.useCallback(() => {
        if (formType === ResponseFormType.MULTIPLE_CHOICE) {
            throttleFetchMc();
        } else if (formType === ResponseFormType.SHORT_ANSWER) {
            throttleFetchSa();
        } else {
            throttleFetchFile();
        }
    }, [formType, throttleFetchMc, throttleFetchSa, throttleFetchFile]);

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
        if (formType === ResponseFormType.FILE) {
            if (requestIsLoaded(FileResultsData)) {
                setFileData(FileResultsData.data);
            }
        }
    }, [
        mcResultsData,
        saResultsData,
        FileResultsData,
        formType,
        setMultipleChoiceData,
        setShortAnswerData,
        setFileData,
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
    if (
        formType === ResponseFormType.FILE &&
        !requestIsLoaded(FileResultsData)
    ) {
        return <Loader className="pt-4 pb-4" />;
    }

    if (formType === ResponseFormType.FILE && !requestIsLoaded(desc)) {
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
    const fileValues =
        formType === ResponseFormType.FILE ? fileData : undefined;

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
            {formType === ResponseFormType.SHORT_ANSWER && saValues && (
                <ShortAnswerResultsTable
                    data={saValues as Array<[string, string]>}
                />
            )}
            {formType === ResponseFormType.FILE && fileValues && (
                <>
                    <p>
                        Description:{" "}
                        {desc.data?.desc
                            ? desc.data?.desc
                            : "No description was provided"}
                    </p>
                    <hr></hr>
                    {fileData.length > 0 ? (
                        <FileContainer
                            {...props.fileContainerData}
                            socket={props.sock}
                            files={fileData}
                            updateFiles={throttleFetchFile}
                            roomType={RoomType.CLASS}
                            containerType={FileUploadType.RESPONSE}
                        />
                    ) : (
                        <>
                            No responses have been made yet.<br></br>
                        </>
                    )}
                </>
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
