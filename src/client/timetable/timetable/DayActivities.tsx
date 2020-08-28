import React from "react";
import { CourseActivityResponseType } from "../../../types";

type Props = {
    activities: CourseActivityResponseType[];
};

export const DayActivities: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <div className="day-activities">

        </div>
    );
};
