const express = require("express");
const router = express.Router();
const { generateQuestions } = require("../controllers/questionController");

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the GMFI API" });
});

// New route for generating questions
router.post("/generate-questions", generateQuestions);

module.exports = router;
