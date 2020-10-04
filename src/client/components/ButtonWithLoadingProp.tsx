import React from "react";
import { Button } from "react-bootstrap";
import { Loader } from "./Loader";

type Props = React.ComponentProps<typeof Button> & {
    invertLoader?: boolean;
    loading?: boolean;
};

export const ButtonWithLoadingProp: React.FunctionComponent<Props> = (
    props: Props
) => {
    const updatedProps = { ...props };
    delete updatedProps.invertLoader;
    delete updatedProps.loading;
    return (
        <Button {...updatedProps}>
            {props.loading ? (
                <Loader invert={props.invertLoader} />
            ) : (
                props.children
            )}
        </Button>
    );
};
