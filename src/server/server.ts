import express, { Express } from "express";
import path from "path";
import dotenv from "dotenv";

import { router as HealthCheckRoute } from "./routes/health-check";
import { Database } from "./database";

dotenv.config();

const app: Express = express();

app.use(express.static("build"));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type, Authorization"
    );
    next();
});

// Base route.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "build/index.html"));
});

// Health check route.
app.use("/health", HealthCheckRoute);

// TODO API Routes
app.use("/api", () => {});

const database: Database = new Database(process.env.MONGODB_URI || "");
database.connect().then(() => {
    app.listen(process.env.PORT || 5000, async () => {
        console.log("Server is listening on", process.env.PORT || 5000);
    });
});
