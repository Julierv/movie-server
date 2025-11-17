const express = require('express');
const router = express.Router();
const databaseModule = require('../modules/database');

router.post('/getAiRecommendations', async (req, res) => {
  try {
    const { selected } = req.body;
    const recommendations = await databaseModule.getAiRecommendations(selected);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/getRandomItems', async (req, res) => {
  try {
    const randomItems = await databaseModule.getRandomItems();
    res.json(randomItems);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
