import React from "react";

type Props = {
    selectedWeek: number;
};

// TODO: Hard-coded days
export const DayHeading: React.FunctionComponent<Props> = (props) => {
    return (
        <div className="timetable-day-heading">
            {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ].map((day: string) => (
                <div>{day}</div>
            ))}
        </div>
    );
};
