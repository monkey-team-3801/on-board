import React from "react";
import CanvasDraw from "react-canvas-draw";
import { useSocket, useFetch, useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    sessionId: string;
};

export const DrawingCanvas: React.FunctionComponent<Props> = (props: Props) => {
    const canvasRef: React.RefObject<CanvasDraw> = React.useRef<CanvasDraw | null>(
        null
    );

    const [canvasDisabled, setCanvasDisabled] = React.useState<boolean>(true);

    const [canvasDataResponse] = useFetch<any, any>("/session/getCanvas", {
        sessionId: props.sessionId,
    });

    const [, saveCanvasData] = useDynamicFetch<any, any>(
        "/session/saveCanvas",
        {},
        false
    );

    const { socket, data } = useSocket("canvasDraw", "");

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
        <div
            onMouseUp={() => {
                if (canvasDisabled) {
                    return;
                }
                const data = canvasRef.current?.getSaveData();
                socket.emit("canvasChange", {
                    sessionId: props.sessionId,
                    canvasData: data,
                });
                saveCanvasData({
                    sessionId: props.sessionId,
                    canvasData: data,
                });
            }}
        >
            <button
                onClick={() => {
                    const y = canvasRef.current?.getSaveData();
                    console.log(y);
                }}
            >
                Clear
            </button>
            <CanvasDraw
                ref={canvasRef}
                saveData={canvasDataResponse.data.canvasData}
                loadTimeOffset={0}
                disabled={canvasDataResponse.data.canvasData && canvasDisabled}
            />
        </div>
    );
};
