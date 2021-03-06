import express from "express";
import { version } from "uuid";
import { ResponseFormType } from "../../types";
import { User } from "../database";
import { Response } from "../database/schema/Response";
import {
    FileForm,
    IFileForm,
    IMultipleChoiceResponseForm,
    IShortAnswerResponseForm,
    MultipleChoiceResponseForm,
    ShortAnswerResponseForm,
} from "../database/schema/ResponseForm";
import { asyncHandler } from "../utils";

export const router = express.Router();

/**
 * Route to submit a multiple choice form.
 */
router.post(
    "/submitMcForm",
    asyncHandler<
        undefined,
        {},
        {
            options: { [key: string]: string };
            question: string;
            sessionID: string;
            userID: string;
        }
    >(async (req, res) => {
        const formOptions = new Map<string, string>(
            Object.entries(req.body.options)
        );
        const question = req.body.question;
        const sid = req.body.sessionID;
        const uid = req.body.userID;

        if (formOptions.size > 6 || formOptions.size < 1) {
            res.status(500).end();
            return;
        }

        let responses: Map<string, number> = new Map();
        for (let key of Array.from(formOptions.keys())) {
            if (!version(key)) {
                res.status(500).end();
                return;
            }
            responses.set(key, 0);
        }

        try {
            await MultipleChoiceResponseForm.create({
                sessionID: sid,
                question: question,
                type: ResponseFormType.MULTIPLE_CHOICE,
                options: formOptions,
                count: responses,
                answered: [],
                owner: uid,
            });
            res.status(200).end();
            return;
        } catch (e) {
            res.status(500);
            throw new Error(
                "An unexpected error has occured. Your form was not created."
            );
        }
    })
);

/**
 * Route to submit a short answer form.
 */
router.post(
    "/submitSaForm",
    asyncHandler<{}, {}, { sessionID: string; question: string; uid: string }>(
        async (req, res) => {
            const question = req.body.question;
            const sid = req.body.sessionID;
            const uid = req.body.uid;

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
                throw new Error(
                    "An unexpected error has occured. Your form was not created."
                );
            }
        }
    )
);

/**
 * Route to submit a file submission form.
 */
router.post(
    "/submitFileForm",
    asyncHandler<
        undefined,
        {},
        { sid: string; uid: string; question: string; desc: string }
    >(async (req, res) => {
        try {
            await FileForm.create({
                sessionID: req.body.sid,
                question: req.body.question,
                owner: req.body.uid,
                type: ResponseFormType.FILE,
                answered: [],
                description: req.body.desc,
                files: [],
            });
            res.status(200).end();
        } catch (error) {
            res.status(500);
            throw new Error(
                "An unexpected error has occured. Your form was not created."
            );
        }
    })
);

/**
 * Gets all form associated with a session.
 */
router.post(
    "/getFormsBySession",
    asyncHandler<
        {
            MC: Array<[string, string]>;
            SA: Array<[string, string]>;
            FF: Array<[string, string]>;
        },
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
        const FileFormQuery = await FileForm.find({
            sessionID: sid,
        });

        const MCForms = MCFormQuery.map((form) => form.id);
        const SAForms = SAFormQuery.map((form) => form.id);

        const MCFormQuestions = MCFormQuery.map((form) => form.question);
        const SAFormQuestions = SAFormQuery.map((form) => form.question);

        let MCFormData: Map<string, string> = new Map();
        let SAFormData: Map<string, string> = new Map();
        const FileFormData = (
            await Promise.all(
                FileFormQuery.map(async (form) => {
                    const question = form.question;
                    const id = form.id;
                    return [id, question] as [
                        string | undefined,
                        string | undefined
                    ];
                })
            )
        ).filter(
            (data): data is [string, string] =>
                data[0] !== undefined && data[1] !== undefined
        );

        MCForms.forEach((key, i) => MCFormData.set(key, MCFormQuestions[i]));
        SAForms.forEach((key, i) => SAFormData.set(key, SAFormQuestions[i]));

        res.send({
            MC: Array.from(MCFormData),
            SA: Array.from(SAFormData),
            FF: FileFormData,
        })
            .status(200)
            .end();
    })
);

/**
 * Gets a single multiple choice form by id.
 */
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

/**
 * Gets a single file submission form by id.
 */
router.post(
    "/getFileFormByID",
    asyncHandler<{ description: string }, {}, { formID: string }>(
        async (req, res) => {
            const formQuery = await FileForm.findById(req.body.formID);
            if (formQuery) {
                res.send({ description: formQuery.description })
                    .status(200)
                    .end();
            } else {
                res.send({ description: "" }).status(200).end();
            }
        }
    )
);

/**
 * Check if a given user has answered the form.
 */
router.post(
    "/checkAnswered",
    asyncHandler<
        { found: boolean },
        {},
        { userID: string; formID: string; formType: ResponseFormType }
    >(async (req, res) => {
        let query:
            | IMultipleChoiceResponseForm
            | IShortAnswerResponseForm
            | IFileForm
            | null = null;

        if (req.body.formType === ResponseFormType.MULTIPLE_CHOICE) {
            query = await MultipleChoiceResponseForm.findById(req.body.formID);
        } else if (req.body.formType === ResponseFormType.SHORT_ANSWER) {
            query = await ShortAnswerResponseForm.findById(req.body.formID);
        } else if (req.body.formType === ResponseFormType.FILE) {
            query = await FileForm.findById(req.body.formID);
        }

        if (query) {
            if (query.answered.includes(req.body.userID)) {
                res.send({ found: true }).status(200).end();
                return;
            }
        }
        res.send({ found: false }).status(200).end();
    })
);

/**
 * Route for submitting an answer to a multiple choice form.
 */
router.post(
    "/answerMultipleChoice",
    asyncHandler<
        undefined,
        {},
        { formID: string; userID: string; option: string }
    >(async (req, res) => {
        const formID = req.body.formID;
        const choice = req.body.option;
        const userID = req.body.userID;

        const query = await MultipleChoiceResponseForm.findById(formID);

        if (query) {
            if (query.answered.includes(userID)) {
                res.status(500).end();

                return;
            }
            const currentValue = query.count?.get(choice);
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

/**
 * Route for submitting an answer to a short answer form.
 */
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

/**
 * Route to get the results of a multiple choice form.
 */
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

/**
 * Route to get the results of a short answer form.
 */
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

                    const dataArray = (
                        await Promise.all(
                            responseIDs.map(async (id) => {
                                const response = await Response.findById(id);
                                const user = await User.findById(
                                    response?.userID
                                );
                                return [
                                    user?.username,
                                    response?.userResponse,
                                ] as [string | undefined, string | undefined];
                            })
                        )
                    ).filter(
                        (x): x is [string, string] =>
                            x[0] !== undefined && x[1] !== undefined
                    );
                    res.send(dataArray).status(200).end();
                }
            }
        }
    )
);

/**
 * Route to get only the description of a file submission form..
 */
router.post(
    "/getFileFormDesc",
    asyncHandler<{ desc: string }, {}, { formID: string }>(async (req, res) => {
        const query = await FileForm.findById(req.body.formID);
        if (query) {
            res.send({ desc: query.description }).status(200).end();
        }
        res.status(500).end();
    })
);
