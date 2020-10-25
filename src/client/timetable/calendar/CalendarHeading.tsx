import React from "react";
import { format } from "date-fns";
import { BiLeftArrow, BiRightArrow } from "react-icons/bi";

type Props = {
    month: number;
    year: number;
    setMonthRange: (month: number, year: number) => void;
};

export const CalendarHeading: React.FunctionComponent<Props> = ({
    month,
    year,
    setMonthRange,
}) => {
    const monthHeading: string = format(new Date(year, month), "MMMM,yyyy");
    const [monthName, yearName] = monthHeading.split(",");
    return (
        <div className="month-heading">
            <div className="heading-container">
                <div
                    className="left-chevron"
                    onClick={() => {
                        const newMonth = month === 0 ? 12 : month - 1;
                        const newYear = newMonth === 12 ? year - 1 : year;
                        setMonthRange(newMonth, newYear);
                    }}
                >
                    <BiLeftArrow/>
                </div>
                <div className="heading">
                    <h1>
                        {monthName} {yearName}
                    </h1>
                </div>
                <div
                    className="right-chevron"
                    onClick={() => {
                        const newMonth = month === 11 ? 0 : month + 1;
                        const newYear = newMonth === 1 ? year + 1 : year;
                        setMonthRange(newMonth, newYear);
                    }}
                >
                    <BiRightArrow/>
                </div>
            </div>
        </div>
    );
};
