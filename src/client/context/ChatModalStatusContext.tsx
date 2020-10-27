import React from "react";
import { ChatModalStatusType } from "../types";

type ChatModalContextType = {
    // Status of the chat modal.
    status: ChatModalStatusType;
    // On modal close callback.
    onClose?: () => void;
    // On modal open callback, accepts a optional target user id to immediately open.
    onOpen?: (selectedId?: string) => void;
};

/**
 * Context for opening and closing the chat modal.
 */
export const ChatModalStatusContext = React.createContext<ChatModalContextType>(
    {
        status: {
            open: false,
        },
    }
);
