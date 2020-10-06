import React from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { RGBColor } from "react-color";
import { CanvasEvent } from "../../events";
import {
    GetCanvasRequestType,
    GetCanvasResponseType,
    SaveCanvasRequestType,
    Stroke,
} from "../../types";
import { ColourPicker } from "../colour";
import { useDynamicFetch, useFetch } from "../hooks";
import { requestIsLoaded, throttle } from "../utils";
import "./Canvas.less";

type Props = {
    sessionId: string;
    socket: SocketIOClient.Socket;
};

export const DrawingCanvas: React.FunctionComponent<Props> = (props: Props) => {
    const { sessionId, socket } = props;
    const canvasRef: React.MutableRefObject<
        HTMLCanvasElement | undefined
    > = React.useRef<HTMLCanvasElement>();
    const cursorRef: React.MutableRefObject<
        HTMLDivElement | undefined
    > = React.useRef<HTMLDivElement>();
    const queuedStrokes: React.MutableRefObject<Array<Stroke>> = React.useRef<
        Array<Stroke>
    >([]);

    const isDrawing: React.MutableRefObject<boolean> = React.useRef<boolean>(
        false
    );

    const position: React.MutableRefObject<any> = React.useRef<{
        x?: number;
        y?: number;
    }>({});

    const [penSize, setPenSize] = React.useState<number>(5);
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

    const [, clearCanvasData] = useDynamicFetch<
        undefined,
        GetCanvasRequestType
    >(
        "/session/clearCanvas",
        {
            sessionId: props.sessionId,
        },
        false
    );

    React.useEffect(() => {
        const intervalRef = setInterval(() => {
            if (queuedStrokes.current.length > 0) {
                saveCanvasData({
                    sessionId,
                    strokes: queuedStrokes.current,
                });
                queuedStrokes.current = [];
            }
        }, 10000);
        return () => {
            clearInterval(intervalRef);
            if (queuedStrokes.current.length > 0) {
                saveCanvasData({
                    sessionId,
                    strokes: queuedStrokes.current,
                });
            }
        };
    }, [saveCanvasData, sessionId]);

    const drawLine = React.useCallback(
        (stroke: Stroke, emit: boolean) => {
            const context = canvasRef.current?.getContext("2d") || undefined;
            if (context) {
                const { x0, y0, x1, y1, colour, size } = stroke;
                context.lineCap = "round";
                context.beginPath();
                context.moveTo(x0, y0);
                context.lineTo(x1, y1);
                context.strokeStyle = colour;
                context.lineWidth = size;
                context.stroke();
                context.closePath();

                if (!emit) {
                    return;
                }

                socket.emit(CanvasEvent.DRAW, {
                    sessionId: sessionId,
                    canvasData: stroke,
                });
            }
        },
        [sessionId, socket]
    );

    const onMouseDown = React.useCallback(
        (event: React.MouseEvent<HTMLCanvasElement>) => {
            const e: MouseEvent = event.nativeEvent;
            isDrawing.current = true;
            position.current.x = e.offsetX;
            position.current.y = e.offsetY;
        },
        []
    );

    const onMouseMove = React.useCallback(
        (event: React.MouseEvent<HTMLCanvasElement>) => {
            const e: MouseEvent = event.nativeEvent;
            if (cursorRef.current) {
                cursorRef.current.style.display = "block";
                cursorRef.current.style.left = `${e.offsetX.toString()}px`;
                cursorRef.current.style.top = `${e.offsetY.toString()}px`;
            }

            if (!isDrawing.current) {
                return;
            }
            if (canvasRef.current) {
                setPenSize((size) => {
                    setPenColour((colour) => {
                        const stroke: Stroke = {
                            x0: position.current.x,
                            y0: position.current.y,
                            x1: e.offsetX,
                            y1: e.offsetY,
                            colour: `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`,
                            size,
                        };
                        drawLine(stroke, true);
                        queuedStrokes.current.push(stroke);
                        return colour;
                    });
                    return size;
                });
            }

            position.current.x = e.offsetX;
            position.current.y = e.offsetY;
        },
        [drawLine]
    );

    const onMouseUp = React.useCallback(
        (event: React.MouseEvent<HTMLCanvasElement>) => {
            if (!isDrawing.current) {
                return;
            }
            isDrawing.current = false;
        },
        []
    );

    const onMouseOut = React.useCallback(
        (event: React.MouseEvent<HTMLCanvasElement>) => {
            onMouseUp(event);
            if (cursorRef.current) {
                cursorRef.current.style.display = "none";
            }
            if (queuedStrokes.current.length > 0) {
                saveCanvasData({
                    sessionId,
                    strokes: queuedStrokes.current,
                });
                queuedStrokes.current = [];
            }
        },
        [onMouseUp, saveCanvasData, sessionId]
    );

    const canvasRefCallback = React.useCallback((canvas) => {
        canvasRef.current = canvas;
    }, []);

    const cursorRefCallback = React.useCallback((cursor) => {
        cursorRef.current = cursor;
    }, []);

    React.useEffect(() => {
        socket.on(CanvasEvent.CHANGE, (stroke: Stroke) => {
            drawLine(stroke, false);
        });
        socket.on(CanvasEvent.CLEAR, () => {
            const context = canvasRef.current?.getContext("2d") || undefined;
            context?.clearRect(
                0,
                0,
                canvasRef.current?.width || 0,
                canvasRef.current?.height || 0
            );
        });
        return () => {
            socket.off(CanvasEvent.CHANGE).off(CanvasEvent.CLEAR);
        };
    }, [drawLine, socket]);

    React.useEffect(() => {
        const strokes = canvasDataResponse.data?.strokes;
        if (strokes) {
            strokes.forEach((stroke) => {
                drawLine(stroke, false);
            });
        }
    }, [drawLine, canvasDataResponse]);

    if (!requestIsLoaded(canvasDataResponse)) {
        return <div>loading</div>;
    }

    return (
        <Container className="drawing-canvas" fluid>
            <Row>
                <Col lg={2}>
                    <Form.Control
                        type="range"
                        value={penSize}
                        min={1}
                        max={100}
                        onChange={(e) => {
                            setPenSize(Number(e.target.value));
                        }}
                    />
                    <ColourPicker
                        onChange={(colour) => {
                            setPenColour(colour);
                        }}
                    />
                    <Button
                        onClick={async () => {
                            const context =
                                canvasRef.current?.getContext("2d") ||
                                undefined;
                            context?.clearRect(
                                0,
                                0,
                                canvasRef.current?.width || 0,
                                canvasRef.current?.height || 0
                            );
                            await clearCanvasData({
                                sessionId,
                            });
                            socket.emit(CanvasEvent.CLEAR, {
                                sessionId,
                            });
                        }}
                    >
                        Clear
                    </Button>
                </Col>
                <Col lg={10}>
                    <div className="canvas-container">
                        <canvas
                            ref={canvasRefCallback}
                            width={1000}
                            height={800}
                            onMouseDown={onMouseDown}
                            onMouseUp={onMouseUp}
                            onMouseMove={(e) => {
                                throttle(onMouseMove(e), 10);
                            }}
                            onMouseOut={onMouseOut}
                        />
                        <div
                            ref={cursorRefCallback}
                            className="cursor"
                            style={{
                                width: `${penSize}px`,
                                height: `${penSize}px`,
                                backgroundColor: `rgba(${penColour.r}, ${penColour.g}, ${penColour.b}, ${penColour.a})`,
                            }}
                        />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
