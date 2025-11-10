import express from 'express';
import Event from '../models/Event.js';

const router = express.Router();

router.get('/profile/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const events = await Event.find({ profiles: profileId })
      .populate('profiles')
      .populate('createdBy')
      .populate('updateLogs.updatedBy')
      .sort({ startDateTime: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('profiles')
      .populate('createdBy')
      .populate('updateLogs.updatedBy')
      .sort({ startDateTime: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, profiles, timezone, startDateTime, endDateTime, createdBy } = req.body;
    
    const event = new Event({
      title,
      description,
      profiles,
      timezone,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      createdBy
    });
    
    const savedEvent = await event.save();
    await savedEvent.populate('profiles');
    await savedEvent.populate('createdBy');
    
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const previousValues = {
      title: event.title,
      description: event.description,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      timezone: event.timezone,
      profiles: event.profiles.map(p => p.toString ? p.toString() : p)
    };
    
    const { title, description, startDateTime, endDateTime, timezone, profiles, updatedBy } = req.body;
    
    event.updateLogs.push({
      updatedBy,
      previousValues,
      updatedValues: {
        title: title || event.title,
        description: description || event.description,
        startDateTime: startDateTime ? new Date(startDateTime) : event.startDateTime,
        endDateTime: endDateTime ? new Date(endDateTime) : event.endDateTime,
        timezone: timezone || event.timezone,
        profiles: profiles || event.profiles
      }
    });
    
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (startDateTime) event.startDateTime = new Date(startDateTime);
    if (endDateTime) event.endDateTime = new Date(endDateTime);
    if (timezone) event.timezone = timezone;
    if (profiles) event.profiles = profiles;
    
    const updatedEvent = await event.save();
    await updatedEvent.populate('profiles');
    await updatedEvent.populate('createdBy');
    await updatedEvent.populate('updateLogs.updatedBy');
    
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get event update logs
router.get('/:id/logs', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('updateLogs.updatedBy');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event.updateLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;