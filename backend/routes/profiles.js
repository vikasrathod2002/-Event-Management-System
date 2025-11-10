import express from 'express';
import Profile from '../models/Profile.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find({ isActive: true });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, timezone = 'America/New_York' } = req.body;
    
    const profile = new Profile({
      name,
      timezone
    });
    
    const savedProfile = await profile.save();
    res.status(201).json(savedProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/timezone', async (req, res) => {
  try {
    const { timezone } = req.body;
    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      { timezone },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;