import React from "react";
import { Spinner } from "react-bootstrap";
import "./loader.less";

type Props = {
    invert?: boolean;
    full?: boolean;
    className?: string;
};

export const Loader: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <div
            className={`loader-container ${props.full ? "full" : ""} ${
                props.className
            }`}
        >
            <Spinner
                className={`loader ${props?.invert && "invert"}`}
                animation="grow"
                variant="primary"
            />
        </div>
    );
};
