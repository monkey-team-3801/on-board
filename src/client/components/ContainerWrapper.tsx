import React from "react";
import { Container } from "react-bootstrap";
import { FaFolderOpen } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { Loader } from "./Loader";

type Props = {
    title?: string;
    className?: string;
    children: (
        setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => React.ReactNode;
};

export const ContainerWrapper: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [containerVisible, setContainerVisible] = React.useState<boolean>(
        true
    );

    const [loading, setLoading] = React.useState<boolean>(true);

    React.useLayoutEffect(() => {
        if (containerVisible) {
            setLoading(true);
        }
    }, [containerVisible]);

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

                {containerVisible && (
                    <div>
                        {loading && (
                            <div className="content-loader">
                                <Loader />
                            </div>
                        )}
                        <div style={{ display: loading ? "none" : "unset" }}>
                            {props.children?.(setLoading)}
                        </div>
                    </div>
                )}

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
