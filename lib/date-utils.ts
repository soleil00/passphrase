export const formatTimeAgo=(date: Date | string | undefined): string=> {
    if (!date) return "N/A"
  
    const now = new Date()
    const pastDate = new Date(date)
  
    // Calculate the difference in milliseconds
    const diffMs = now.getTime() - pastDate.getTime()
  
    // Convert to seconds
    const diffSec = Math.floor(diffMs / 1000)
  
    // Less than a minute
    if (diffSec < 60) {
      return `${diffSec} second${diffSec !== 1 ? "s" : ""} ago`
    }
  
    // Less than an hour
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`
    }
  
    // Less than a day
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    }
  
    // Less than a week
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  
    // Less than a month (approximated as 30 days)
    const diffWeeks = Math.floor(diffDays / 7)
    if (diffDays < 30) {
      return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`
    }
  
    // Less than a year (approximated as 365 days)
    const diffMonths = Math.floor(diffDays / 30)
    if (diffDays < 365) {
      return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`
    }
  
    // More than a year
    const diffYears = Math.floor(diffDays / 365)
    return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`
  }


  export const formatCountdown=(date: Date | string | undefined): string=> {
    if (!date) return "N/A";
    
    const now = new Date();
    const futureDate = new Date(date);
    
    // If the date is in the past, use the time ago format
    if (futureDate < now) {
      return formatTimeAgo(date);
    }
    
    // Calculate the difference in milliseconds
    const diffMs = futureDate.getTime() - now.getTime();
    
    // Convert to seconds
    const diffSec = Math.floor(diffMs / 1000);
    
    // Less than a minute
    if (diffSec < 60) {
      return `in ${diffSec} second${diffSec !== 1 ? 's' : ''}`;
    }
    
    // Less than an hour
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return `in ${diffMin} minute${diffMin !== 1 ? 's' : ''}`;
    }
    
    // Less than a day
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
    
    // Less than a week
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    
    // Less than a month
    if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return diffWeeks > 0 
        ? `in ${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} and ${diffDays % 7} day${diffDays % 7 !== 1 ? 's' : ''}`
        : `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    
    // Less than a year
    if (diffDays < 365) {
      const diffMonths = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      return remainingDays > 0
        ? `in ${diffMonths} month${diffMonths !== 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`
        : `in ${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    }
    
    // More than a year
    const diffYears = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;
    const remainingMonths = Math.floor(remainingDays / 30);
    
    if (remainingMonths > 0) {
      return `in ${diffYears} year${diffYears !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
    
    return `in ${diffYears} year${diffYears !== 1 ? 's' : ''}`;
  }