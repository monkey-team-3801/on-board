import React from "react";
import { CourseActivity } from "../../../types";

type Props = {
    activities: CourseActivity[];
};

export const DayActivities: React.FunctionComponent<Props> = (props: Props) => {
    return <div className="day-activities"></div>;
};
