import React from "react";
import { MDBView, MDBMask } from "mdbreact";
import { AiOutlineMessage } from "react-icons/ai";
import { ChatModalStatusContext } from "../context";

type Props = {
    userId: string;
    classNames?: string;
    openChatOnClick?: boolean;
};

export const ProfilePicture = (props: Props) => {
    const modalContext = React.useContext(ChatModalStatusContext);

    return (
        <MDBView hover={props.openChatOnClick} className={props.classNames}>
            <img
                src={`/filehandler/getPfp/${props.userId}`}
                alt="user profile"
            />
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
