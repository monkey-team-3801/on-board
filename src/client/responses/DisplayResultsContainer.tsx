import { useThrottleCallback } from "@react-hook/throttle";
import React from "react";
import { Button, Container, Row } from "react-bootstrap";
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
    userID: string;
    back: () => void;
    sock: SocketIOClient.Socket;
};

export const DisplayResultsContainer = (props: Props) => {
    const fileContainerData = {
        id: props.formData.formID,
        socket: props.sock,
        roomType: RoomType.CLASS,
        containerType: FileUploadType.RESPONSE,
        userID: props.userID,
    };
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
        Array<{
            id: string;
            name: string;
            size: number;
            time: string;
            userId: string;
            username: string;
        }>,
        { id: string; roomType: RoomType; fileUploadType: FileUploadType }
    >(
        "/filehandler/getFiles",
        {
            id: props.formData.formID,
            roomType: RoomType.CLASS,
            fileUploadType: FileUploadType.RESPONSE,
        },
        formType === ResponseFormType.FILE
    );

    const [description] = useDynamicFetch<{ desc: string }, { formID: string }>(
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
        Array<{
            id: string;
            name: string;
            size: number;
            time: string;
            userId: string;
            username: string;
        }>
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
            getFileResults({
                id: props.formData.formID,
                roomType: RoomType.PRIVATE,
                fileUploadType: FileUploadType.RESPONSE,
            });
        },
        1,
        true
    );

    const updateResponses = React.useCallback(() => {
        if (formType === ResponseFormType.MULTIPLE_CHOICE) {
            throttleFetchMc();
        } else if (formType === ResponseFormType.SHORT_ANSWER) {
            throttleFetchSa();
        } else if (formType === ResponseFormType.FILE) {
            throttleFetchFile();
        }
    }, [formType, throttleFetchMc, throttleFetchSa, throttleFetchFile]);

    const mcValues = React.useMemo(() => multipleChoiceData, [
        multipleChoiceData,
    ]);

    const saValues = React.useMemo(() => shortAnswerData, [shortAnswerData]);

    const fileValues = React.useMemo(() => fileData, [fileData]);

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

    if (formType === ResponseFormType.FILE && !requestIsLoaded(description)) {
        return <Loader className="pt-4 pb-4" />;
    }

    return (
        <Container>
            <h1 className="mb-4">{props.formData.question}</h1>
            {formType === ResponseFormType.MULTIPLE_CHOICE &&
                (mcValues.length > 0 && requestIsLoaded(mcResultsData) ? (
                    <MultipleChoiceResultsChart
                        data={mcValues[1].map((option, i) => {
                            return {
                                name: option,
                                value: Number(mcValues[0]?.[i]),
                            };
                        })}
                    />
                ) : (
                    <Loader />
                ))}
            {formType === ResponseFormType.SHORT_ANSWER &&
                (saValues && requestIsLoaded(saResultsData) ? (
                    <ShortAnswerResultsTable
                        data={saValues as Array<[string, string]>}
                    />
                ) : (
                    <Loader />
                ))}
            {formType === ResponseFormType.FILE && fileValues && (
                <>
                    <p>
                        {description.data?.desc
                            ? description.data?.desc
                            : "No description was provided"}
                    </p>
                    <Row className="mt-4">
                        {fileData.length > 0 ? (
                            <FileContainer
                                {...fileContainerData}
                                updateFiles={throttleFetchFile}
                                files={fileData}
                            />
                        ) : (
                            <>
                                No responses have been made yet.<br></br>
                            </>
                        )}
                    </Row>
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
