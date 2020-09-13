import React from "react";
import "../styles/FileContainer.less";
import { FaDownload } from "react-icons/fa";
import { useDynamicFetch, useSocket } from "../hooks";

type Props = {
    sessionID: string;
};

export const FileContainer: React.FunctionComponent<Props> = (props: Props) => {
    const [fileData, getFiles] = useDynamicFetch<any, any>(
        "/filehandler/getFiles",
        { sid: props.sessionID },
        true
    );

    useSocket("newfile", undefined, undefined, () => {
        console.log("test");
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

    console.log(fileData);

    // Downloads the given file.
    function download(name: string): void {
        let link = document.createElement("a");

        let blob = new Blob([fileData.data[name].file], {
            type: fileData.data[name].fileExtension,
        });

        link.href = window.URL.createObjectURL(blob);
        link.download = fileData.data[name].filename;
        link.click();
    }

    return (
        <div className="file-container">
            <h1 className="file-list-header">Uploaded Files</h1>
            <div>
                {fileData.data &&
                    Object.keys(fileData.data).map((files, i) => (
                        <div className="file-bar" key={i}>
                            <div>
                                <button
                                    className="file-dl-btn"
                                    // onClick={() => download(files)}
                                >
                                    <a
                                        href={`/filehandler/file/${props.sessionID}/${files}`}
                                        target="_self"
                                        download
                                    >
                                        test
                                    </a>
                                    <FaDownload />
                                </button>

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
