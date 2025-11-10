import mongoose from 'mongoose';

const updateLogSchema = new mongoose.Schema({
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  previousValues: {
    type: Object,
    default: {}
  },
  updatedValues: {
    type: Object,
    default: {}
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  }],
  timezone: {
    type: String,
    required: true,
    default: 'America/New_York'
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  updateLogs: [updateLogSchema]
}, {
  timestamps: true
});

eventSchema.pre('save', function(next) {
  if (this.endDateTime <= this.startDateTime) {
    next(new Error('End date/time must be after start date/time'));
  } else {
    next();
  }
});

export default mongoose.model('Event', eventSchema);