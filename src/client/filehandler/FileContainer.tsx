import React from "react";
import { useDynamicFetch } from "../hooks";

type Props = {
    sessionId: string;
};

export const FileContainer: React.FunctionComponent<Props> = (props: Props) => {
    const [data, getFiles] = useDynamicFetch<any, any>(
        "/filehandler/getFiles",
        { sid: props.sessionId },
        true
    );

    function test(): void {
        console.log(data.data);
    }

    return (
        <div>
            <h1>document test</h1>
            <button onClick={test}>click</button>
        </div>
    );
};
