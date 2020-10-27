import React from "react";
import { Form } from "react-bootstrap";
import format from "date-fns/format";
import parse from "date-fns/parse";

type Props = {
    // Current time.
    time: Date;
    // On change callback with the new Date object.
    onChange: (time: Date) => void;
    // Is the picker disabled.
    disabled?: boolean;
};

/**
 * Simple date picker component. Converts outputs to Date objects.
 */
export const SimpleDatepicker: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Form.Control
            defaultValue={
                props.time.toString() !== "Invalid Date"
                    ? format(props.time, "yyyy-MM-dd'T'HH:mm")
                    : undefined
            }
            type="datetime-local"
            onChange={(e) => {
                props.onChange(
                    parse(e.target.value, "yyyy-MM-dd'T'HH:mm", new Date())
                );
            }}
            disabled={props.disabled}
        />
    );
};
