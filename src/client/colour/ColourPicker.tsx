import React from "react";

import { RGBColor, SketchPicker } from "react-color";


type Props = {
    onChange?: (colour: RGBColor) => void;
};

export const ColourPicker: React.FunctionComponent<Props> = (props: Props) => {
    const [colour, setColour] = React.useState<RGBColor>({
        r: 0,
        g: 0,
        b: 0,
        a: 1,
    });



    return (
        <div>
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
    );
};
