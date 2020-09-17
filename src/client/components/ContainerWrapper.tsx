import React from "react";
import { Container } from "react-bootstrap";
import { FaFolderOpen } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

type Props = {
    title?: string;
    className?: string;
    children: (
        setShowLoader: React.Dispatch<React.SetStateAction<boolean>>
    ) => React.ReactNode;
};

export const ContainerWrapper: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [containerVisible, setContainerVisible] = React.useState<boolean>(
        true
    );

    const [, setShowLoader] = React.useState<boolean>(false);

    return (
        <Container className="content-container" fluid>
            <Container
                className={`content-internal ${props.className || ""}`}
                fluid
            >
                {props.title && (
                    <header>
                        <h1>{props.title}</h1>
                    </header>
                )}
                {containerVisible && props.children?.(setShowLoader)}
                <div
                    className="toggle"
                    onClick={() => {
                        setContainerVisible(!containerVisible);
                    }}
                >
                    {containerVisible ? <AiOutlineClose /> : <FaFolderOpen />}
                </div>
            </Container>
        </Container>
    );
};
