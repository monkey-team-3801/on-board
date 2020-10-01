export const DEFAULT_FONT_SIZE: number = parseInt(
    window
        .getComputedStyle(document.body)
        .getPropertyValue("font-size")
        .replace("px", "")
);

export const MARGIN: number = 0.25 * DEFAULT_FONT_SIZE; // 0.25em, equivalent to m-1 in bootstrap

export const TIME_SLOT_HEIGHT: number = 50;
