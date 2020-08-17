import express, { Express } from "express";
import path from "path";
import dotenv from "dotenv";

import { router as HealthCheckRoute } from "./routes/health-check";
import { asyncHandler } from "./utils";
import { Database } from "./database";

dotenv.config();

const app: Express = express();

// Request initialiser
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type, Authorization"
    );
    next();
});

// Base route
app.get(
    "/",
    asyncHandler(async (req, res, next) => {
        next();
    })
);

// Automatically serve the index.html file from the build folder
app.use("/", express.static("build"));

// Health check route.
app.use("/health", HealthCheckRoute);

// TODO API Routes
app.use(
    "/api",
    asyncHandler(async (req, res, next) => {})
);

// Catch-all route
app.use(
    "*",
    asyncHandler(async (req, res, next) => {})
);

const database: Database = new Database(process.env.MONGODB_URI);
database.connect().then(() => {
    app.listen(process.env.PORT || 5000, async () => {
        console.log("Server is listening on", process.env.PORT || 5000);
    });
});
