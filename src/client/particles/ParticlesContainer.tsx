import React from "react";
import Particles from "react-particles-js";

export const ParticlesContainer: React.FunctionComponent = () => {
    return (
        <Particles
            params={{
                particles: {
                    number: {
                        value: 80,
                        density: {
                            enable: true,
                            value_area: 1500,
                        },
                    },
                    line_linked: {
                        enable: true,
                        opacity: 0.02,
                    },
                    move: {
                        direction: "right",
                        speed: 0.1,
                    },
                    size: {
                        value: 1,
                    },
                    opacity: {
                        anim: {
                            enable: true,
                            speed: 1,
                            opacity_min: 0.05,
                        },
                    },
                },
                interactivity: {
                    events: {
                        onclick: {
                            enable: true,
                            mode: "push",
                        },
                    },
                    modes: {
                        push: {
                            particles_nb: 1,
                        },
                    },
                },
                retina_detect: true,
            }}
        />
    );
};
