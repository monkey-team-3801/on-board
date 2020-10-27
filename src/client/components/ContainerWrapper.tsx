import React from "react";
import { Container, Card } from "react-bootstrap";
import { FaFolderOpen } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { Loader } from "./Loader";

type Props = {
    // Title of the card container.
    title?: string;
    // Additional classnames to inject.
    className?: string;
    // Additional children of this wrapper.
    children: (
        setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => React.ReactNode;
    // Disable shadow.
    noShadow?: boolean;
};

/**
 * Top level route component wrapper to display grids of content on the different pages.
 */
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
        <Container className="content-container my-4" fluid>
            <Card
                className={`content-internal ${props.className || ""}`}
                style={{
                    boxShadow: props.noShadow ? "none" : undefined,
                }}
            >
                {props.title && (
                    <Card.Header className="purple-gradient">
                        <h1 className="m-0">{props.title}</h1>
                    </Card.Header>
                )}

                {containerVisible && (
                    <Card.Body>
                        {loading && (
                            <div className="content-loader">
                                <Loader />
                            </div>
                        )}
                        <div style={{ display: loading ? "none" : "unset" }}>
                            {props.children?.(setLoading)}
                        </div>
                    </Card.Body>
                )}

                <div
                    className="toggle"
                    onClick={() => {
                        setContainerVisible(!containerVisible);
                    }}
                >
                    {containerVisible ? <AiOutlineClose /> : <FaFolderOpen />}
                </div>
            </Card>
        </Container>
    );
};
