import React from "react";
import { MDBView, MDBMask } from "mdbreact";
import { AiOutlineMessage } from "react-icons/ai";
import { ChatModalStatusContext } from "../context";

type Props = {
    userId: string;
    className?: string;
    imgClassName?: string;
    openChatOnClick?: boolean;
    showStatusOrb?: boolean;
    online?: boolean;
};

export const ProfilePicture = (props: Props) => {
    const modalContext = React.useContext(ChatModalStatusContext);

    return (
        <MDBView hover={props.openChatOnClick} className={props.className}>
            <img
                src={`/filehandler/getPfp/${props.userId}`}
                alt="user profile"
                className={props.imgClassName}
            />
            {props.showStatusOrb && (
                <div
                    className={`orb ${
                        props.online
                            ? "tempting-azure-gradient"
                            : "heavy-rain-gradient"
                    }`}
                />
            )}
            {props.openChatOnClick && (
                <MDBMask
                    className="flex-center"
                    overlay="purple-strong"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                        modalContext.onOpen?.(props.userId);
                    }}
                >
                    <AiOutlineMessage />
                </MDBMask>
            )}
        </MDBView>
    );
};
