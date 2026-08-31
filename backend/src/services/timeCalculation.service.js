

const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return "00:00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const calculateProductivity = (session) => {
  const total = session.totalSeconds || 0;
  const working = session.workingSeconds || 0;
  const idle = session.idleSeconds || 0;
  const paused = session.pausedSeconds || 0;

  const productivityPercentage = total > 0 ? (working / total) * 100 : 0;
  
  const idlePercentage = total > 0 ? (idle / total) * 100 : 0;
  
  const nonProductiveTime = idle + paused;
  const nonProductivePercentage = total > 0 ? (nonProductiveTime / total) * 100 : 0;

  return {
    totalTrackedTime: total,
    workingTime: working,
    idleTime: idle,
    pausedTime: paused,
    nonProductiveTime: nonProductiveTime,
    productivityPercentage: Math.min(productivityPercentage, 100),
    idlePercentage: Math.min(idlePercentage, 100),
    nonProductivePercentage: Math.min(nonProductivePercentage, 100),
    
    totalTrackedTimeFormatted: formatDuration(total),
    workingTimeFormatted: formatDuration(working),
    idleTimeFormatted: formatDuration(idle),
    pausedTimeFormatted: formatDuration(paused),
    nonProductiveTimeFormatted: formatDuration(nonProductiveTime),
  };
};

const calculateProgress = (actualSeconds, expectedSeconds) => {
  if (expectedSeconds <= 0) return { progressPercentage: 0, remainingSeconds: 0 };
  
  const percentage = (actualSeconds / expectedSeconds) * 100;
  const remaining = Math.max(expectedSeconds - actualSeconds, 0);
  
  return {
    progressPercentage: Math.min(percentage, 100),
    remainingSeconds: remaining,
    remainingFormatted: formatDuration(remaining),
    expectedSeconds: expectedSeconds,
    expectedFormatted: formatDuration(expectedSeconds),
    actualSeconds: actualSeconds,
    actualFormatted: formatDuration(actualSeconds),
  };
};

const getDateRange = (type, date) => {
  const now = date ? new Date(date) : new Date();
  
  if (type === "daily") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
  
  if (type === "weekly") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }
  
  if (type === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }
  
  throw new Error("Invalid report type");
};

const getExpectedWorkingSeconds = (settings, startDate, endDate) => {
  const hoursPerDay = settings.workingHoursPerDay || 8;
  const workingDaysPerWeek = settings.workingDaysPerWeek || 5;
  
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) {
    return hoursPerDay * workingDaysPerWeek * 3600;
  }
  
  let workingDays = 0;
  const current = new Date(startDate);
  while (current < endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  
  return hoursPerDay * workingDays * 3600;
};

module.exports = {
  formatDuration,
  calculateProductivity,
  calculateProgress,
  getDateRange,
  getExpectedWorkingSeconds,
};