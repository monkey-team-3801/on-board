import React from "react";
import { Button } from "react-bootstrap";
import { Loader } from "./Loader";

type Props = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
    invertLoader?: boolean;
    onAsyncClick?: (
        e: React.MouseEvent<HTMLElement, MouseEvent>
    ) => void | Promise<void>;
};

export const LoaderButton: React.FunctionComponent<Props> = (props: Props) => {
    const [loading, setLoading] = React.useState<boolean>(false);

    return (
        <Button
            {...props}
            onClick={async (e) => {
                setLoading(true);
                await props.onAsyncClick?.(e);
                setLoading(false);
            }}
        >
            {loading ? <Loader invert={props.invertLoader} /> : props.children}
        </Button>
    );
};
