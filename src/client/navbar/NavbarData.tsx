import React from "react";
import * as AiIcons from "react-icons/ai";

export const NavbarData = [
    {
        title: "Home",
        path: "/",
        icon: <AiIcons.AiOutlineHome />,
        cName: "nav-text",
    },
    {
        title: "Courses",
        path: "/courses",
        icon: <AiIcons.AiOutlineBook />,
        cName: "nav-text",
    },
    {
        title: "Grades",
        path: "/grades",
        icon: <AiIcons.AiOutlineFileDone />,
        cName: "nav-text",
    },
    {
        title: "Classes",
        path: "/classes",
        icon: <AiIcons.AiOutlinePlayCircle />,
        cName: "nav-text",
    },
];
