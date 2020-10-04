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
    return (
        <Button {...props}>
            {props.loading ? (
                <Loader invert={props.invertLoader} />
            ) : (
                props.children
            )}
        </Button>
    );
};
