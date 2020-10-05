import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis } from "recharts";
type Props = {
    data: Array<{ name: string; value: number }>;
};

export const MultipleChoiceResultsChart: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <ResponsiveContainer width="100%" height={500}>
            <BarChart data={props.data}>
                <XAxis dataKey="name" />
                <Bar dataKey="value" fill="#5c4e8e" />;
            </BarChart>
        </ResponsiveContainer>
    );
};
