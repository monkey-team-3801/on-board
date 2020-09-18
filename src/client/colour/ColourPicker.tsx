import React from "react";
import { Button } from "react-bootstrap";
import { SketchPicker, RGBColor } from "react-color";

type Props = {
    onChange?: (colour: RGBColor) => void;
};

export const ColourPicker: React.FunctionComponent<Props> = (props: Props) => {
    const [pickerVisible, setPickerVisible] = React.useState<boolean>(false);
    const [colour, setColour] = React.useState<RGBColor>({
        r: 0,
        g: 0,
        b: 0,
        a: 1,
    });

    return (
        <div>
            <Button
                onClick={() => {
                    setPickerVisible(!pickerVisible);
                }}
            >
                Colour Picker
            </Button>
            {pickerVisible && (
                <div
                    style={{
                        position: "absolute",
                        zIndex: 16,
                    }}
                >
                    <SketchPicker
                        color={colour}
                        onChange={(colour) => {
                            setColour(colour.rgb);
                        }}
                        onChangeComplete={(colour) => {
                            props.onChange?.(colour.rgb);
                        }}
                    />
                </div>
            )}
        </div>
    );
};
