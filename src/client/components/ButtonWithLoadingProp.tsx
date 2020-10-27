import React from "react";
import { Button } from "react-bootstrap";
import { Loader } from "./Loader";

type Props = React.ComponentProps<typeof Button> & {
    // Invert the colour on the loader.
    invertLoader?: boolean;
    // Loading state.
    loading?: boolean;
};

/**
 * Simple button which accepts a loading prop.
 */
export const ButtonWithLoadingProp: React.FunctionComponent<Props> = (
    props: Props
) => {
    const updatedProps = { ...props };
    delete updatedProps.invertLoader;
    delete updatedProps.loading;
    return (
        <Button {...updatedProps} disabled={props.loading || props.disabled}>
            {props.loading ? (
                <Loader invert={props.invertLoader} />
            ) : (
                props.children
            )}
        </Button>
    );
};
