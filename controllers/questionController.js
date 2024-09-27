const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateQuestions = async (req, res) => {
  try {
    const { category, number, difficulty } = req.body;

    // Construct the prompt for Gemini
    const prompt = `Generate ${number} ${difficulty} questions about ${category}. For each question, provide exactly 4 options and the correct answer. Format the response as a JSON array of objects, each with 'question', 'options' (an array of 4 strings), and 'answer' (a string matching one of the options) fields.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Remove JSON code block markers if present
    const cleanedText = text.replace(/```json\n|\n```/g, "").trim();

    // Attempt to parse the cleaned text as JSON
    let questions;
    try {
      questions = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return res
        .status(500)
        .json({ error: "Failed to parse generated questions" });
    }

    // Validate and process the questions
    if (!Array.isArray(questions)) {
      return res
        .status(500)
        .json({ error: "Generated content is not an array" });
    }

    questions = questions
      .filter(
        (q) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          q.answer
      )
      .map((q) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
      }));

    // Ensure we have the correct number of questions
    questions = questions.slice(0, number);

    res.json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};

module.exports = {
  generateQuestions,
};
