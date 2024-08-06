const express = require('express');
const router = express.Router();
const Vocabulary = require('../models/vocabulary');
const { default: axios } = require('axios');

const url = 'https://convert-tu-vung-a4dyqf7unq-uc.a.run.app/convert_tu_vung';
const vocabularies = [
  {
    _id: '1',
    type: 'Noun',
    japaneseWord: 'ありがとう',
    meaning: 'Cảm ơn',
    reading: 'Arigatou',
    activity: 'Greeting',
    hanReading: '',
    notes: 'Used to thank someone'
  },
  // Thêm nhiều từ vựng hơn tại đây
];

// Create - Thêm mới từ vựng
router.post('/', async (req, res) => {
  try {
    const { type, japaneseWord, meaning, notes } = req.body;
    const response = await axios.post(url2, { "query": "勉強し" })
      .catch(error => {
        console.error(`Error: ${error}`);
      });

    const reading = response.data
    const activity = "active"
    const hanReading = 

    // const newVocabulary = new Vocabulary(req.body);
    res.json(req.body)
    // const savedVocabulary = await newVocabulary.save();
    // res.status(201).json(savedVocabulary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read - Lấy tất cả từ vựng
router.get('/', async (req, res) => {
  try {
    const vocabularies = await Vocabulary.find();
    res.json(vocabularies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read - Lấy từ vựng theo ID
router.get('/:id', async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    if (!vocabulary) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }
    res.json(vocabulary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update - Cập nhật từ vựng theo ID
router.put('/:id', async (req, res) => {
  try {
    const updatedVocabulary = await Vocabulary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedVocabulary) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }
    res.json(updatedVocabulary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete - Xóa từ vựng theo ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedVocabulary = await Vocabulary.findByIdAndDelete(req.params.id);
    if (!deletedVocabulary) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }
    res.json({ message: 'Vocabulary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
