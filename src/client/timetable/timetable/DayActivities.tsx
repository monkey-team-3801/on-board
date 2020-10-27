import React from "react";
import { CourseActivity } from "../../../types";

type Props = {
    activities: CourseActivity[];
};

/**
 * Component representing a list of all activities in a day.
 */
export const DayActivities: React.FunctionComponent<Props> = (props: Props) => {
    return <div className="day-activities"></div>;
};
