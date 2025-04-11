// Function to calculate the difference in days between a given timestamp and the current date
export function getDaysDifferenceFromToday(timestamp) {
  const currentDate = new Date();

  // Parse the timestamp into a Unix timestamp (milliseconds since Jan 1, 1970)
  const givenUnixTimestamp = Date.parse(timestamp);

  // Calculate the time difference in milliseconds
  const timeDifference = currentDate - givenUnixTimestamp;

  // Convert milliseconds to days
  const days = Math.round(timeDifference / (1000 * 60 * 60 * 24));

  return days;
}

export function formatDate(inputDate) {
  const date = new Date(inputDate);
  const months = [
    "ЯНВ",
    "ФЕВ",
    "МАР",
    "АПР",
    "МАЙ",
    "ИЮН",
    "ИЮЛ",
    "АВГ",
    "СЕН",
    "ОКТ",
    "НОЯ",
    "ДЕК",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const formattedDate = `${day} ${month} ${hours}:${minutes}`;

  return formattedDate;
}

export const formatRussianDateTime = (dateString) => {
  const date = new Date(dateString);
  
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year} в ${hours}:${minutes}`;
};
