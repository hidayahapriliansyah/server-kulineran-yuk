import fs from 'fs';
import mustache from 'mustache';

import expiredAtFormatter from '../../utils/expiredAtFormatter';

type EmailTemplate = 
  'CUSTOMER_VERIFICATION'
  | 'CUSTOMER_RESET_PASSWORD_REQUEST'
  | 'RESTO_VERIFICATION'
  | 'RESTO_RESET_PASSWORD_REQUEST';

const renderEmailHTMLTempalate = (type: EmailTemplate, {
  redirectLink,
  receiverName,
  expiredAt,
}: {
  redirectLink: string,
  receiverName: string,
  expiredAt: Date,
}): string => {
  let template: string;
  if (type === 'CUSTOMER_VERIFICATION') {
    template = fs.readFileSync('src/views/email/customerVerification.html', 'utf-8');
  } else if (type === 'CUSTOMER_RESET_PASSWORD_REQUEST') {
    template = fs.readFileSync('src/views/email/customerResetPasswordRequest.html', 'utf-8');
  } else if (type === 'RESTO_VERIFICATION') {
    template = fs.readFileSync('src/views/email/restoVerification.html', 'utf-8');
  } else {
    template = fs.readFileSync('src/views/email/restoResetPasswordRequest.html', 'utf-8');
  }
  const formattedExpiredAt = expiredAtFormatter(expiredAt);
  const dataView = {
    name: receiverName,
    link: redirectLink,
    expiredAt: formattedExpiredAt,
  }
  return mustache.render(template, dataView)
};

export default renderEmailHTMLTempalate;