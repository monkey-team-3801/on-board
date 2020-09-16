import React from "react";
import CanvasDraw from "react-canvas-draw";
import { Button, Form, Row, Container } from "react-bootstrap";

import { useSocket, useFetch, useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import {
    GetCanvasResponseType,
    GetCanvasRequestType,
    SaveCanvasRequestType,
} from "../../types";
import { CanvasEvent } from "../../events";
import { ColourPicker } from "../colour";
import { RGBColor } from "react-color";

type Props = {
    sessionId: string;
};

export const DrawingCanvas: React.FunctionComponent<Props> = (props: Props) => {
    const canvasRef: React.RefObject<CanvasDraw> = React.useRef<CanvasDraw | null>(
        null
    );

    const [canvasDisabled, setCanvasDisabled] = React.useState<boolean>(true);
    const [penSize, setPenSize] = React.useState<number>(10);
    const [penColour, setPenColour] = React.useState<RGBColor>({
        r: 0,
        g: 0,
        b: 0,
        a: 1,
    });

    const [canvasDataResponse] = useFetch<
        GetCanvasResponseType,
        GetCanvasRequestType
    >("/session/getCanvas", {
        sessionId: props.sessionId,
    });

    const [, saveCanvasData] = useDynamicFetch<
        undefined,
        SaveCanvasRequestType
    >(
        "/session/saveCanvas",
        {
            sessionId: props.sessionId,
        },
        false
    );

    const { socket, data } = useSocket(CanvasEvent.CHANGE, "");

    React.useEffect(() => {
        setTimeout(() => {
            setCanvasDisabled(false);
        }, 500);
    }, []);

    React.useEffect(() => {
        canvasRef.current?.loadSaveData(
            data || JSON.stringify({ lines: [], width: 400, height: 400 }),
            true
        );
    }, [data]);

    if (!requestIsLoaded(canvasDataResponse)) {
        return <div>loading</div>;
    }

    return (
        <Container>
            <Row>
                <Button
                    onClick={() => {
                        canvasRef?.current?.clear();
                        const emptyCanvas = canvasRef.current?.getSaveData();
                        socket.emit(CanvasEvent.DRAW, {
                            sessionId: props.sessionId,
                            canvasData: emptyCanvas,
                        });
                        saveCanvasData({
                            sessionId: props.sessionId,
                            canvasData: emptyCanvas,
                        });
                    }}
                >
                    Clear
                </Button>
                <Form.Control
                    type="range"
                    min={1}
                    max={20}
                    onChange={(e) => {
                        setPenSize(Number(e.target.value));
                    }}
                />
                <ColourPicker
                    onChange={(colour) => {
                        setPenColour(colour);
                        console.log(colour);
                    }}
                />
            </Row>
            <Row>
                <div
                    onMouseUp={() => {
                        if (canvasDisabled) {
                            return;
                        }
                        const data = canvasRef.current?.getSaveData();
                        socket.emit(CanvasEvent.DRAW, {
                            sessionId: props.sessionId,
                            canvasData: data,
                        });
                        saveCanvasData({
                            sessionId: props.sessionId,
                            canvasData: data,
                        });
                    }}
                >
                    <CanvasDraw
                        ref={canvasRef}
                        saveData={canvasDataResponse.data.canvasData}
                        loadTimeOffset={0}
                        disabled={
                            canvasDataResponse.data?.canvasData !== "" &&
                            canvasDisabled
                        }
                        brushRadius={penSize}
                        brushColor={`rgba(${penColour?.r},${penColour?.g},${penColour?.b},${penColour?.a})`}
                        hideGrid
                        canvasWidth={1000}
                        canvasHeight={1000}
                    />
                </div>
            </Row>
        </Container>
    );
};
