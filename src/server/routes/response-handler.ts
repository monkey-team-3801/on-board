import express from "express";
import { version } from "uuid";
import { ResponseFormType } from "../../types";
import {
    MultipleChoiceResponseForm,
    ShortAnswerResponseForm,
} from "../database/schema/ResponseForm";
import { asyncHandler } from "../utils";

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
        if (!version(key)) {
            res.status(500).end();
        }
        options.set(key, value);
        responses.push(0);
    });
    if (question && sid) {
        try {
            await MultipleChoiceResponseForm.create({
                sessionID: sid,
                question: question,
                type: ResponseFormType.MULTIPLE_CHOICE,
                options: options,
                count: responses,
            });
            res.status(200).end();
        } catch (e) {
            res.status(500);
            new Error(
                "An unexpected error has occured. Your form was not created."
            );
        }
    }
});

router.post("/submitSaForm", async (req, res) => {
    const formOptions = new Map<string, string>(Object.entries(req.body));
    const question = formOptions.get("question");
    const sid = formOptions.get("sessionID");

    if (question && sid) {
        try {
            await ShortAnswerResponseForm.create({
                sessionID: sid,
                question: question,
                type: ResponseFormType.SHORT_ANSWER,
            });
            res.status(200).end();
        } catch (e) {
            res.status(500);
            new Error(
                "An unexpected error has occured. Your form was not created."
            );
        }
    }
});

router.post(
    "/getFormsBySession",
    asyncHandler<Array<Array<string>>, {}, { sid: string }>(
        async (req, res) => {
            const sid = req.body.sid;
            const MCFormQuery = await MultipleChoiceResponseForm.find({
                sessionID: sid,
            });
            const SAFormQuery = await ShortAnswerResponseForm.find({
                sessionID: sid,
            });
            const MCForms = MCFormQuery.map((x) => x.id);
            const SAForms = SAFormQuery.map((x) => x.id);
            res.send([MCForms, SAForms]).status(200).end();
        }
    )
);
