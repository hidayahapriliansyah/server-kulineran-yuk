const expiredAtFormatter = (expiredAt: Date): string => {
  const option: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  };  

  const formatter = new Intl.DateTimeFormat('id-ID', option);
  const formatterExpiredAt = formatter.format(expiredAt);
  return formatterExpiredAt;
};

export default expiredAtFormatter;
