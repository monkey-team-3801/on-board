import React from "react";
import { useDynamicFetch } from "../hooks";
import "../styles/FileContainer.less";
import { FaDownload } from "react-icons/fa";
import { FileStorageType } from "../../types";

type Props = {
    sessionId: string;
};

export const FileContainer: React.FunctionComponent<Props> = (props: Props) => {
    const [data, getFiles] = useDynamicFetch<any, any>(
        "/filehandler/getFiles",
        { sid: props.sessionId },
        true
    );

    function sizeDisplay(size: number): string {
        if (size === 0) {
            return "0 Bytes";
        }

        const sizes = ["Bytes", "KB", "MB"];
        const k = 1024;
        const i = Math.floor(Math.log(size) / Math.log(k));

        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    function download(name: string): void {
        let link = document.createElement("a");
        let blob = new Blob([data.data[name].file], {
            type: data.data[name].fileExtension,
        });
        link.href = window.URL.createObjectURL(blob);
        link.download = data.data[name].filename;
        link.click();
    }

    return (
        <div className="file-container">
            <h1 className="file-list-header">Uploaded Files</h1>
            <div>
                {data.data &&
                    Object.keys(data.data).map((files, i) => (
                        <div className="file-bar" key={i}>
                            <div>
                                <button
                                    className="file-dl-btn"
                                    onClick={() => download(files)}
                                >
                                    <FaDownload />
                                </button>

                                <div className="file-name">
                                    {data.data[files].filename}{" "}
                                    {sizeDisplay(data.data[files].size)}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
