export type TimeRange = [number, number, number];

export type ClashedInfo = {
    stacked: number;
    stackIndex: number;
};

export type ClashedResult = {
    [key: number]: ClashedInfo;
};
