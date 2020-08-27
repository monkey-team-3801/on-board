import React from "react";
// import logo from "./logo.svg";
import "./styles/App.less";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppRouter } from "./AppRouter";

export const App: React.FunctionComponent<{}> = () => {
    return <AppRouter></AppRouter>;
};
