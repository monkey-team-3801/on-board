import React from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Label,
} from "recharts";
type Props = {
    data: Array<{ name: string; value: number }>;
};

export const MultipleChoiceResultsChart: React.FunctionComponent<Props> = (
    props: Props
) => {
    if (
        props.data
            .map((data) => data.value)
            .reduce((prev, curr) => prev + curr) === 0
    ) {
        return <div>There is no data available.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={500}>
            <BarChart data={props.data}>
                <XAxis dataKey="name" label="Responses" />
                <YAxis dataKey="value">
                    <Label
                        angle={-90}
                        value="# Responses"
                        position="insideLeft"
                        style={{ textAnchor: "middle" }}
                    />
                </YAxis>
                <Bar dataKey="value" fill="#5c4e8e" />;
            </BarChart>
        </ResponsiveContainer>
    );
};
