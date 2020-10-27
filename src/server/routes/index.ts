export { router as healthCheckRoute } from "./health-check";
export { router as sessionRoute } from "./session";
export { router as chatRoute } from "./chat";
export { router as userRoute, noAuthRouter as userNoAuthRoute } from "./user";
export { router as courseRoute } from "./course";
export { router as authRoute } from "./auth";
export { router as videoRoute } from "./video";
export { router as jobRoute } from "./job";
export {
    router as fileRoute,
    noAuthRouter as fileNoAuthRoute,
} from "./filehandler";
export { router as responseRoute } from "./response-handler";
