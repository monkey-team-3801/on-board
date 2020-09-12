import React, { useEffect } from "react";
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

    return (
        <div>
            <h1>document test</h1>
            <div>
                {data.data &&
                    Object.keys(data.data).map((files, i) => (
                        <div className="file-list-container" key={i}>
                            <div>
                                <div className="file-logo"></div>
                                <div className="file-name">
                                    {data.data[files].filename}
                                </div>
                                <div className="file-size">
                                    {data.data[files].size}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
