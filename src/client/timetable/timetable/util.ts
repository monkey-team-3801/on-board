import { MARGIN, TIME_SLOT_HEIGHT } from "./constants";
import { TimeRange, ClashedResult } from "./types";

/**
 * Convert session properties to CSS properties in an object that's suitable for react styling
 * @param startTime: Session start time, in hours
 * @param endTime: Session end time, in hours
 * @param startDay: start hour of day, as int
 * @param endDay: end hour of day, as int
 * @param stacked: number of clashing sessions
 * @param stackIndex: index of this session relative to other clashing sessions
 */
export const sessionStyleFromProps = (
    startTime: number,
    endTime: number,
    startDay: number,
    endDay: number,
    stacked: number,
    stackIndex: number
) => {
    // Which time slot does this start from? 0th, 1st, 2nd or 3rd, etc.
    const relativeStart = Math.max(Math.min(startTime, endDay) - startDay, 0);
    const relativeEnd = Math.max(Math.min(endTime, endDay) - startDay, 0);
    const top = relativeStart * (TIME_SLOT_HEIGHT + MARGIN);
    const sessionDuration = relativeEnd - relativeStart;
    const height =
        sessionDuration * TIME_SLOT_HEIGHT +
        Math.max(Math.ceil(sessionDuration - 1), 0) * MARGIN;
    const display = sessionDuration ? "block" : "none";
    const topPx = `${top}px`;
    const heightPx = `${height}px`;
    const width = `calc((100% - ${(stacked - 1) * MARGIN}px) / ${stacked})`;
    const left = `calc(((100% - ${
        (stacked - 1) * MARGIN
    }px) / ${stacked} + ${MARGIN}px) * ${stackIndex})`;
    return { top: topPx, height: heightPx, display, width, left };
};

/**
 * Return all ranges with clashed information
 * 2 ranges clash if a range starts later than the other's start, but earlier than its end.
 * @param ranges: array of ranges. A range is an array with the structure [id, start, end]
 * @returns array of objects holding clashed info. Each object has the following structure
 *      {
 *          stacked: int,
 *          stackIndex: int
 *      }
 *      where stacked represents the number of ranges this range clashes with
 *            stackIndex represents the index of this range relative to its clashing range.
 */
export const getClashedRanges = (ranges: TimeRange[]): ClashedResult => {
    ranges.sort(([id1, start1, end1], [id2, start2, end2]) =>
        start1 - start2 !== 0 ? start1 - start2 : end1 - end2
    );
    let lastEnd: number = 0;
    let clashedIds: number[] = [];
    let result: ClashedResult = {};
    for (const [id, start, end] of ranges) {
        if (start >= lastEnd) {
            // no crashing at this entry
            // Save all found classing ranges to result
            // TODO: type warning
            clashedIds.forEach((clashedId, index) => {
                result[clashedId] = {
                    stacked: clashedIds.length,
                    stackIndex: index,
                };
            });

            // Clear current clashing ranges
            clashedIds = [];
        }
        // Push current id to be checked at next iteration
        clashedIds.push(id);
        lastEnd = end;
    }
    // Last iteration, save last clashing ranges to result
    clashedIds.forEach((clashedId, index) => {
        result[clashedId] = {
            stacked: clashedIds.length,
            stackIndex: index,
        };
    });
    return result;
};
