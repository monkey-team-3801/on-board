import React from "react";
import { format } from "date-fns";
import { State as CalendarState } from "./Calendar";

type Props = {
    month: number;
    year: number;
    setTimeFrame: React.Dispatch<React.SetStateAction<CalendarState>>;
};

export const CalendarHeading: React.FunctionComponent<Props> = ({
    month,
    year,
    setTimeFrame,
}) => {
    const monthHeading: string = format(new Date(year, month), "MMMM, yyyy");
    const head = monthHeading.split(",");
    return (
        <div className="month-heading">
            <div className="heading-container">
                <div
                    className="left-chevron"
                    onClick={() =>
                        setTimeFrame((prevState) => {
                            const newChosenMonth: number =
                                prevState.chosenMonth - 1;
                            const newChosenYear: number =
                                newChosenMonth === -1
                                    ? prevState.chosenYear - 1
                                    : prevState.chosenYear;
                            return {
                                chosenMonth:
                                    newChosenMonth === -1 ? 11 : newChosenMonth,
                                chosenYear: newChosenYear,
                            };
                        })
                    }
                >
                    &lt;
                </div>
                <div className="heading">
                    <h1>
                        {`${head[0]}`} {`${head[1]}`}
                    </h1>
                </div>
                <div
                    className="right-chevron"
                    onClick={() =>
                        setTimeFrame((prevState) => {
                            const newChosenMonth =
                                (prevState.chosenMonth + 1) % 12;
                            const newChosenYear =
                                newChosenMonth === 0
                                    ? prevState.chosenYear + 1
                                    : prevState.chosenYear;
                            return {
                                chosenMonth: newChosenMonth,
                                chosenYear: newChosenYear,
                            };
                        })
                    }
                >
                    &gt;
                </div>
            </div>
        </div>
    );
};
