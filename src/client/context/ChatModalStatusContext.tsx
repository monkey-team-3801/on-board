import React from "react";
import { ChatModalStatusType } from "../types";

type ChatModalContextType = {
    status: ChatModalStatusType;
    onClose?: () => void;
    onOpen?: () => void;
};

export const ChatModalStatusContext = React.createContext<ChatModalContextType>(
    {
        status: {
            open: false,
        },
    }
);
