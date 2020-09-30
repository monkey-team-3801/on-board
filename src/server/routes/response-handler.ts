import express from "express";
import { ResponseForm } from "../database/schema/ResponseForm";

export const router = express.Router();

router.post("/submitMcForm", async (req, res) => {
    const formOptions = new Map<string, string>(Object.entries(req.body));
    const question = formOptions.get("question");
    const sid = formOptions.get("sessionID");

    if (formOptions.size > 8 || formOptions.size < 3) {
        res.status(500).end();
    }

    let options: Map<string, string> = new Map();
    let responses: Array<number> = [];

    formOptions.forEach((value, key) => {
        if (key === "sessionID" || key === "question") {
            return;
        }
        options.set(key, value);
        responses.push(0);
    });
    if (question && sid) {
        try {
            const response = await ResponseForm.create({
                sessionID: sid,
                question: question,
                options: options,
                count: responses,
            });
            res.status(500).end();
        } catch (e) {
            res.status(500);
            new Error(
                "An unexpected error has occured. Your form was not created."
            );
        }
    }
});

router.post("/submitSaForm", async (req, res) => {
    console.log(req.body);
});
