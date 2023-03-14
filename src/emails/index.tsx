import { createTransport, type Transporter } from 'nodemailer';
import { type ReactElement } from 'react';
import { render } from '@react-email/render';

import { Welcome } from './welcome';
import { env } from '~/env.mjs';

const createTransporter = (): Transporter => {
  const port = parseInt(env.SMTP_PORT);

  return createTransport({
    host: env.SMTP_HOST,
    secure: port === 465,
    port,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  }) as Transporter;
};

const sendEmail = async ({ to, subject, email }: { to: string; subject: string; email: ReactElement }) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      to,
      // from: env.SMTP_FROM,
      subject,
      html: render(email),
    });
  } catch (error) {
    console.error(error);
  }
};

export const sendWelcomeEmail = async ({ to, name }: { to: string; name: string }) =>
  sendEmail({
    to,
    subject: `Welcome to ${env.NEXT_PUBLIC_APP_NAME}`,
    email: <Welcome name={name} />,
  });