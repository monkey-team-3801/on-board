import express, { Express } from "express";
import { router as HealthCheckRoute } from "./routes/health-check";
import path from "path";

const app: Express = express();

app.use(express.static("build"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "build/index.html"));
})
    .use(HealthCheckRoute);

app.listen(process.env.PORT || 5000);
