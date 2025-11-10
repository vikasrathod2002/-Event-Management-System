import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Common timezones
export const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney'
];

export const timezoneLabels = {
  'UTC': 'UTC',
  'America/New_York': 'Eastern Time (ET)',
  'America/Chicago': 'Central Time (CT)',
  'America/Denver': 'Mountain Time (MT)',
  'America/Los_Angeles': 'Pacific Time (PT)',
  'Europe/London': 'London Time (GMT)',
  'Europe/Paris': 'Paris Time (CET)',
  'Asia/Kolkata': 'India (IST)',
  'Asia/Tokyo': 'Japan Time (JST)',
  'Australia/Sydney': 'Sydney Time (AEST)'
};

export const formatDateTime = (date, timezone) => {
  return dayjs(date).tz(timezone).format('YYYY-MM-DDTHH:mm');
};

export const formatDisplayDateTime = (date, timezone) => {
  return dayjs(date).tz(timezone).format('MMM D, YYYY h:mm A');
};

export const formatDisplayDate = (date, timezone) => {
  return dayjs(date).tz(timezone).format('MMM D, YYYY');
};

export const formatDisplayTime = (date, timezone) => {
  return dayjs(date).tz(timezone).format('h:mm A');
};

export const convertToTimezone = (date, fromTimezone, toTimezone) => {
  return dayjs.tz(date, fromTimezone).tz(toTimezone).toDate();
};

// Get current month calendar days
export const getCalendarDays = (timezone) => {
  const now = dayjs().tz(timezone);
  const startOfMonth = now.startOf('month');
  const endOfMonth = now.endOf('month');
  
  const days = [];
  let currentDay = startOfMonth.startOf('week');
  
  while (currentDay.isBefore(endOfMonth.endOf('week'))) {
    days.push({
      date: currentDay.toDate(),
      isCurrentMonth: currentDay.month() === now.month(),
      isToday: currentDay.isSame(now, 'day')
    });
    currentDay = currentDay.add(1, 'day');
  }
  
  return days;
};