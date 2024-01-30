const express = require('express');
const router = express.Router();
const path = require('path');

const questionnaireDataPath = path.resolve(__dirname, '..', 'Questionnaire.json');
const questionnaireData = require(questionnaireDataPath);

let page = 1;
let currentScore = 0;
const questions = questionnaireData.questionnaire.find(item => item.page_no === page);

router.get('/api/questionnaire', (req, res, next) => {
    try {
        currentScore = 0;
        res.json(questions);
    } catch (err) {
        next(err);
    }
});

router.post('/api/questionnaire/responses', (req, res) => {

    const responses = req.body.response;
    page = req.body.currentPage;

    const currentQuestions = questionnaireData.questionnaire.find(item => item.page_no === page);
    const questionsLength = currentQuestions.questions.length;
    let nextPage = page;
    let score = currentScore;
    let count = 0;

    for (const [questionId, response] of Object.entries(responses)) {
        const currentAnswers = currentQuestions.answers.find(a => a.question_id === parseInt(questionId));
        const correctOption = currentAnswers.correct_option;
        const scores = currentQuestions.options.find(a=>a.option_text === response);
        const correctAnswerScore =scores .score;
            score+=correctAnswerScore;
        if (page === 1) {
            if (questionId === "1") {
                if (response === correctOption) {
                    nextPage = currentQuestions.skip_page.correct_goto_page;
                   
                    break;
                }
            }
            if (questionId === "2") {
                if (response !== correctOption) {
                    nextPage = currentQuestions.skip_page.wrong_goto_page;
                    break;
                } 
            }
            if (questionId === "3") {
                if (response !== correctOption) {
                    nextPage = currentQuestions.skip_page.wrong_goto_page;
                } else {
                    nextPage = currentQuestions.skip_page.correct_goto_page;
                }
            }
        }
        if (page === 2) {
            if (response === correctOption) {
                nextPage = currentQuestions.skip_page.correct_goto_page;
            } else {
                nextPage = currentQuestions.skip_page.wrong_goto_page;
            }
        }
        if (page === 3 || page === 4 || page === 5 || page === 6) {
            if (response === correctOption) {
                count += 1;
            }
            if (count < questionsLength) {
                nextPage = currentQuestions.skip_page.wrong_goto_page;
            }
            else {
                nextPage = currentQuestions.skip_page.correct_goto_page;
            }
        }
    }

    currentScore = score;
    page = nextPage;
    const nextQuestions = questionnaireData.questionnaire.find(item => item.page_no === nextPage);
    res.json({ questions: nextQuestions, nextPage: nextPage, currentScore: score });
});

module.exports = router;
