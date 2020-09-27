import { OrderedMap } from "immutable";
import React from "react";
import { Button, Form } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

type Props = {
    q: string;
};

export const MultipleChoiceContainer = (props: Props) => {
    const g: [string, string][] = [[uuidv4(), ""]];
    const x = OrderedMap<string, string>(g);
    const [options, setOptions] = React.useState<OrderedMap<string, string>>(x);

    const submitForm = (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        // Fails silently for now.
        if (!props.q) {
            return;
        }
    };

    return (
        <Form
            onSubmit={(e) => {
                submitForm(e);
            }}
        >
            <Form.Group>
                <button
                    disabled={options.size > 5}
                    onClick={() => {
                        const key = uuidv4();
                        setOptions(options.set(key, ""));
                    }}
                >
                    +
                </button>
            </Form.Group>

            {Array.from(options.entries()).map(([key, value], i) => {
                return (
                    <Form.Group key={key}>
                        <Input
                            optionKey={key}
                            index={i}
                            value={value}
                            onChange={(key, value) => {
                                setOptions(options.set(key, value));
                            }}
                            onDelete={(key) => {
                                setOptions(options.delete(key));
                            }}
                        />
                    </Form.Group>
                );
            })}
            <Button type="submit">Submit</Button>
            {props.q ? null : <div>please fill out the question field.</div>}
        </Form>
    );
};

const Input = ({
    optionKey,
    value,
    index,
    onDelete,
    onChange,
}: {
    optionKey: string;
    value: string;
    index: number;
    onDelete: (key: string) => void;
    onChange: (key: string, value: string) => void;
}) => {
    return (
        <div style={{ display: "block " }}>
            <p>Option {index + 1}</p>
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(optionKey, e.target.value);
                }}
                required={true}
            />
            {index >= 1 && (
                <button
                    onClick={() => {
                        onDelete(optionKey);
                    }}
                >
                    x
                </button>
            )}
        </div>
    );
};
