import React from "react";
import "../styles/FileContainer.less";
import { FaDownload } from "react-icons/fa";
import { BaseResponseType } from "../types";

type Props = {
    fileData: BaseResponseType<any>;
};

export const FileContainer: React.FunctionComponent<Props> = (props: Props) => {
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

    console.log(props.fileData);

    // Downloads the given file.
    function download(name: string): void {
        let link = document.createElement("a");

        let blob = new Blob([props.fileData.data[name].file], {
            type: props.fileData.data[name].fileExtension,
        });

        link.href = window.URL.createObjectURL(blob);
        link.download = props.fileData.data[name].filename;
        link.click();
    }

    return (
        <div className="file-container">
            <h1 className="file-list-header">Uploaded Files</h1>
            <div>
                {props.fileData.data &&
                    Object.keys(props.fileData.data).map((files, i) => (
                        <div className="file-bar" key={i}>
                            <div>
                                <button
                                    className="file-dl-btn"
                                    onClick={() => download(files)}
                                >
                                    <FaDownload />
                                </button>

                                <div className="file-name">
                                    {props.fileData.data[files].filename}{" "}
                                    {sizeDisplay(
                                        props.fileData.data[files].size
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
