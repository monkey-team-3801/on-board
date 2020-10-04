import React from "react";
import "../styles/FileContainer.less";
import { FaDownload } from "react-icons/fa";
import { useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { FileUploadEvent } from "../../events";

type Props = {
    sessionID: string;
    socket: SocketIOClient.Socket;
};

export const FileContainer: React.FunctionComponent<Props> = (props: Props) => {
    const [fileData, getFileData] = useDynamicFetch<
        Array<Array<string>>,
        { sid: string }
    >("/filehandler/getFiles", { sid: props.sessionID }, true);

    const [files, setFiles] = React.useState<Array<Array<string>>>([]);

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

    const updateFileList = React.useCallback(() => {
        getFileData({ sid: props.sessionID });
    }, [getFileData, props.sessionID]);

    React.useEffect(() => {
        props.socket.on(FileUploadEvent.NEW_FILE, updateFileList);
        return () => {
            props.socket.off(FileUploadEvent.NEW_FILE, updateFileList);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (requestIsLoaded(fileData)) {
            setFiles(fileData.data);
        }
    }, [fileData]);

    return (
        <div className="file-container">
            <h1 className="file-list-header">Uploaded Files</h1>
            <div>
                {Object.values(files).map((file, i) => (
                    <div className="file-bar" key={i}>
                        <div>
                            <div className="file-name">
                                {file[1]}
                                {" - "}
                                {sizeDisplay(parseInt(file[2]))}
                                <br></br>
                                {"At: "}
                                {file[3]}
                            </div>
                            <a
                                href={`/filehandler/file/${file[0]}`}
                                target="_self"
                                download
                                style={{ float: "right" }}
                            >
                                <button className="file-dl-btn">
                                    <FaDownload />
                                </button>
                            </a>
                            <hr></hr>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
