const express = require("express");

const isAuth = require("../middleware/isAuth");
const questionController = require("../controllers/question");

const router = express.Router();

// POST /question
router.post("/", isAuth, questionController.answerQuestion);

module.exports = router;
