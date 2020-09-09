import React from "react";
import { useDropzone } from "react-dropzone";
import "../styles/UploadContainer.less";
import { useDynamicFetch } from "../hooks";
import { FileUploadType } from "../../types";

// To differentiate between documents and profile pictures.
type Props = {
    uploadType: FileUploadType;
};

export const UploadContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [, uploadFile] = useDynamicFetch<undefined, FormData>(
        "filehandler/upload",
        undefined,
        false
    );

    // This needs to be updated to contain relevant file types as well.
    function checkValid(files: Array<File>): boolean {
        if (props.uploadType === FileUploadType.PROFILE) {
            return files.length === 1;
        }
        // Limit amount of files uploaded at once to 5 for now.
        if (props.uploadType === FileUploadType.DOCUMENTS) {
            return files.length > 0 && files.length < 6;
        }
        return false;
    }

    const onDrop = async (acceptedFiles: Array<File>) => {
        console.log(acceptedFiles);
        if (!checkValid(acceptedFiles)) {
            console.log("failed");
            return;
        }
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
            formData.append(file.name, file, file.name);
        });

        await uploadFile(formData);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    return (
        <div {...getRootProps()} className="dropContainer">
            <input {...getInputProps()} />
            {isDragActive ? (
                <p className="dropMessage">Drop the files here ...</p>
            ) : (
                <p className="dropMessage">
                    Drag 'n' drop some files here, or click to select files
                </p>
            )}
        </div>
    );
};
