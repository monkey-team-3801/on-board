import React from "react";
import { MDBView, MDBMask } from "mdbreact";
import { AiOutlineMessage } from "react-icons/ai";
import { ChatModalStatusContext } from "../context";

type Props = {
    // Current user id.
    userId: string;
    // Additional injected class name.
    className?: string;
    // Classname for the image tag.
    imgClassName?: string;
    // Should this open the chat modal on click.
    openChatOnClick?: boolean;
    // Should this show the online status orb.
    showStatusOrb?: boolean;
    // Is the user online.
    online?: boolean;
};

/**
 * Profile picture component for rendering a single user's profile picture.
 * Has the additional ability to open the chat modal on click.
 */
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
