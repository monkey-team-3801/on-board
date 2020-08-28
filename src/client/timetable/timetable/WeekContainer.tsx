import React from "react";
import range from "lodash/range";

import "./WeekContainer.less";
import { WeekDay } from "./WeekDay";

type Props = {
    selectedWeek: number;
    startDay: number;
    endDay: number;
};

export const WeekContainer: React.FunctionComponent<Props> = ({selectedWeek, startDay, endDay}) => {
    return <div className="timetable-week-container">
        {range(1, 8).map(isoDay => (
            <WeekDay startDay={startDay} endDay={endDay}/>
        ))}
    </div>;
};
