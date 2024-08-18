const express = require('express');
const router = express.Router();
const { classifyVocabularyByField } = require('../src/genkit');
const { generateVocabularyForms } = require('../src/genkit');
const axios = require('axios');

router.post('/search', async (req, res) => {
  const { subject } = req.body;
  try {
    const classify = await classifyVocabularyByField(subject)
    const vocabularyForms = await generateVocabularyForms(subject)
    const yomikata = await axios.post("https://convert-tu-vung-a4dyqf7unq-uc.a.run.app", { query: subject })
    // res.json({ suggestion, classify, vocabularyUsage, vocabularyForms });
    res.json({ japaneseWord: subject, ...classify, vocabularyForms, ...yomikata.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
