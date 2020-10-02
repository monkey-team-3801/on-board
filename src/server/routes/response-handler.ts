import express from "express";
import { version } from "uuid";
import { ResponseFormType } from "../../types";
import { User } from "../database";
import { Response } from "../database/schema/Response";
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
    let responses: Map<string, number> = new Map();

    formOptions.forEach((value, key) => {
        if (key === "sessionID" || key === "question" || key === "userID") {
            return;
        }
        if (!version(key)) {
            res.status(500).end();
            return;
        }
        options.set(key, value);
        responses.set(key, 0);
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
            return;
        } catch (e) {
            res.status(500);
            new Error(
                "An unexpected error has occured. Your form was not created."
            );
        }
    }
    res.status(500).end();
});

router.post("/submitSaForm", async (req, res) => {
    const formOptions = new Map<string, string>(Object.entries(req.body));
    const question = formOptions.get("question");
    const sid = formOptions.get("sessionID");
    const uid = formOptions.get("uid");

    if (question && sid && uid) {
        try {
            await ShortAnswerResponseForm.create({
                sessionID: sid,
                question: question,
                type: ResponseFormType.SHORT_ANSWER,
                answered: [],
                owner: uid,
                responseID: [],
            });

            res.status(200).end();
            return;
        } catch (e) {
            res.status(500);
            new Error(
                "An unexpected error has occured. Your form was not created."
            );
        }
    }
    res.status(500).end();
});

router.post(
    "/getFormsBySession",
    asyncHandler<
        { MC: Array<Array<string>>; SA: Array<Array<string>> },
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
                return;
            }
            res.status(500).end();
        }
    )
);

router.post(
    "/checkAnswered",
    asyncHandler<{ found: boolean }, {}, { userID: string; formID: string }>(
        async (req, res) => {
            const query = await MultipleChoiceResponseForm.findById(
                req.body.formID
            );
            if (query) {
                if (query.answered.includes(req.body.userID)) {
                    res.send({ found: true }).status(200).end();
                    return;
                }
            } else {
                const query2 = await ShortAnswerResponseForm.findById(
                    req.body.formID
                );
                if (query2) {
                    if (query2.answered.includes(req.body.userID)) {
                        res.send({ found: true }).status(200).end();
                        return;
                    }
                }
            }
            res.send({ found: false }).status(200).end();
        }
    )
);

router.post(
    "/answerMultipleChoice",
    asyncHandler<
        undefined,
        {},
        { formID: string; userID: string; option: string }
    >(async (req, res) => {
        const options = new Map<string, string>(Object.entries(req.body));
        const formID = options.get("formID");
        const choice = options.get("option");
        const userID = options.get("userID");

        const query = await MultipleChoiceResponseForm.findById(formID);

        if (choice && query && userID) {
            if (query.answered.includes(userID)) {
                res.status(500).end();
                return;
            }
            const currentValue = query?.count?.get(choice);
            if (currentValue !== undefined) {
                query.count?.set(choice, currentValue + 1);
                query.answered.push(userID);
                await query.save();
                res.status(200).end();
                return;
            }
        }
        res.status(500).end();
    })
);

router.post(
    "/answerShortAnswer",
    asyncHandler<
        undefined,
        {},
        {
            userID: string;
            userResponse: string;
            formID: string;
        }
    >(async (req, res) => {
        const formQuery = await ShortAnswerResponseForm.findById(
            req.body.formID
        );

        if (formQuery) {
            if (formQuery.answered.includes(req.body.userID)) {
                res.status(500).end();
                return;
            }
            const query = await Response.create({
                userID: req.body.userID,
                formID: req.body.formID,
                userResponse: req.body.userResponse,
            });
            formQuery.responseID?.push(query.id);
            formQuery.answered.push(req.body.userID);
            await formQuery.save();
            res.status(200).end();
        } else {
            res.status(500).end();
        }
    })
);

router.post(
    "/getMCResults",
    asyncHandler<Array<Array<string>>, {}, { formID: string }>(
        async (req, res) => {
            const query = await MultipleChoiceResponseForm.findById(
                req.body.formID
            );
            if (query) {
                const count = query.count;
                const options = query.options;

                if (count && options) {
                    const dataArray = [
                        Array.from(count.values()).map(String),
                        Array.from(options.values()),
                    ];
                    res.send(dataArray).status(200).end();
                } else {
                    res.status(500).end();
                }
            } else {
                res.status(500).end();
            }
        }
    )
);

router.post(
    "/getSAResults",
    asyncHandler<Array<Array<string>>, {}, { formID: string }>(
        async (req, res) => {
            const query = await ShortAnswerResponseForm.findById(
                req.body.formID
            );
            if (query) {
                if (query.responseID) {
                    const responseIDs = query.responseID;
                    let dataArray: Array<Array<string>> = [];

                    for (let id of responseIDs) {
                        const response = await Response.findById(id);

                        if (response) {
                            const user = await User.findById(response.userID);
                            if (user) {
                                dataArray.push([
                                    user.username,
                                    response.userResponse,
                                ]);
                            }
                        }
                    }
                    res.send(dataArray).status(200).end();
                }
            }
        }
    )
);
