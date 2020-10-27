import React from "react";
import { Spinner } from "react-bootstrap";
import "./loader.less";

type Props = {
    // Invert loader colour.
    invert?: boolean;
    // Should the loader take up full screen size.
    full?: boolean;
    // Additional classnames to inject.
    className?: string;
};

/**
 * Loader component to display an loader while elements are loading.
 */
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
