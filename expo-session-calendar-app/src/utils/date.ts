export const formatDate = (date: Date, format: string): string => {
    const options: Intl.DateTimeFormatOptions = {};
    
    if (format.includes('year')) options.year = 'numeric';
    if (format.includes('month')) options.month = 'long';
    if (format.includes('day')) options.day = 'numeric';
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const compareDates = (date1: Date, date2: Date): number => {
    return date1.getTime() - date2.getTime();
};

export const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};