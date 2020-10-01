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
    const uid = formOptions.get("userID");

    if (formOptions.size > 8 || formOptions.size < 3) {
        res.status(500).end();
    }

    let options: Map<string, string> = new Map();
    let responses: Array<number> = [];

    formOptions.forEach((value, key) => {
        if (key === "sessionID" || key === "question" || key === "userID") {
            return;
        }
        if (!version(key)) {
            res.status(500).end();
        }
        options.set(key, value);
        responses.push(0);
    });
    if (question && sid && uid) {
        try {
            await MultipleChoiceResponseForm.create({
                sessionID: sid,
                question: question,
                type: ResponseFormType.MULTIPLE_CHOICE,
                options: options,
                count: responses,
                answered: [],
                owner: uid,
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
    const uid = formOptions.get("userID");

    if (question && sid && uid) {
        try {
            await ShortAnswerResponseForm.create({
                sessionID: sid,
                question: question,
                type: ResponseFormType.SHORT_ANSWER,
                answered: [],
                owner: uid,
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
    asyncHandler<
        { [formType: string]: Array<Array<string>> },
        {},
        { sid: string }
    >(async (req, res) => {
        const sid = req.body.sid;
        const MCFormQuery = await MultipleChoiceResponseForm.find({
            sessionID: sid,
        });
        const SAFormQuery = await ShortAnswerResponseForm.find({
            sessionID: sid,
        });

        const MCForms = MCFormQuery.map((x) => x.id);
        const SAForms = SAFormQuery.map((x) => x.id);
        const MCFormQuestions = MCFormQuery.map((x) => x.question);
        const SAFormQuestions = SAFormQuery.map((x) => x.question);

        let MCFormData: Map<string, string> = new Map();
        let SAFormData: Map<string, string> = new Map();

        MCForms.forEach((key, i) => MCFormData.set(key, MCFormQuestions[i]));
        SAForms.forEach((key, i) => SAFormData.set(key, SAFormQuestions[i]));

        res.send({ MC: Array.from(MCFormData), SA: Array.from(SAFormData) })
            .status(200)
            .end();
    })
);

router.post(
    "/getMCFormByID",
    asyncHandler<{ [optionID: string]: string }, {}, { formID: string }>(
        async (req, res) => {
            const query = await MultipleChoiceResponseForm.findById(
                req.body.formID
            );
            if (query?.options) {
                res.json(Object.fromEntries(query.options)).status(200).end();
            }
            res.status(500).end();
        }
    )
);

router.post(
    "/answerMultipleChoice",
    asyncHandler(async (req, res) => {
        console.log(req.body);
    })
);
