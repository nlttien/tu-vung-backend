const express = require('express');
const router = express.Router();
const { classifyVocabularyByField } = require('../src/genkit');
const { generateVocabularyForms } = require('../src/genkit');

router.post('/search', async (req, res) => {
  const { subject } = req.body;
  try {
    const classify = await classifyVocabularyByField(subject)
    const vocabularyForms = await generateVocabularyForms(subject)
    // res.json({ suggestion, classify, vocabularyUsage, vocabularyForms });
    res.json({ ...classify, vocabularyForms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
