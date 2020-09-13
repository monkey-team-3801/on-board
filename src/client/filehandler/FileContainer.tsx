import React from "react";
import "../styles/FileContainer.less";
import { FaDownload } from "react-icons/fa";
import { useDynamicFetch, useSocket } from "../hooks";
import { FileStorageType } from "../../types";
import { requestIsLoaded } from "../utils";
import { FileUploadEvent } from "../../events";

type Props = {
    sessionID: string;
};

export const FileContainer: React.FunctionComponent<Props> = (props: Props) => {
    const [fileData, getFiles] = useDynamicFetch<
        { [key: string]: FileStorageType },
        { sid: string }
    >("/filehandler/getFiles", { sid: props.sessionID }, true);

    // Updates the list of files displayed.
    useSocket(FileUploadEvent.NEW_FILE, undefined, undefined, () => {
        getFiles({ sid: props.sessionID });
    });

    // Converts bytes to be displayable.
    function sizeDisplay(size: number): string {
        if (size === 0) {
            return "0 Bytes";
        }

        const sizes = ["Bytes", "KB", "MB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));

        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    if (!requestIsLoaded(fileData)) {
        return <div>loading files...</div>;
    }

    return (
        <div className="file-container">
            <h1 className="file-list-header">Uploaded Files</h1>
            <div>
                {fileData.data &&
                    Object.keys(fileData.data).map((files, i) => (
                        <div className="file-bar" key={i}>
                            <div>
                                <a
                                    href={`/filehandler/file/${props.sessionID}/${files}`}
                                    target="_self"
                                    download
                                >
                                    <button className="file-dl-btn">
                                        <FaDownload />
                                    </button>
                                </a>
                                <div className="file-name">
                                    {fileData.data[files].filename}{" "}
                                    {sizeDisplay(fileData.data[files].size)}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
