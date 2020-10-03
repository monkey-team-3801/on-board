import React from "react";

/**
 * Same as React.useEffect but doesn't run on component mount.
 * Does not support cleanup yet.
 */
export const useComponentDidUpdateEffect = (
    effect: () => void,
    depencendies: React.DependencyList
) => {
    const componentMountedRef = React.useRef<boolean>(false);

    React.useEffect(() => {
        if (componentMountedRef.current) {
            effect();
        } else {
            componentMountedRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, depencendies);
};
