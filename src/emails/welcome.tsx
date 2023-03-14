import {
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { blue } from 'tailwindcss/colors';

import { env } from '~/env.mjs';

type WelcomeProps = {
  name: string;
};

export function Welcome({ name }: WelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`Welcome to ${env.NEXT_PUBLIC_APP_NAME}, a time tracking app.`}
      </Preview>
      <Section style={main}>
        <Container style={container}>
          <Img src={`${env.NEXT_PUBLIC_WEBAPP_URL}/images/logo.png`} width="120" height="120" alt="Lagon" style={logo} />
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>
            Welcome to {env.NEXT_PUBLIC_APP_NAME}, a time tracking app integrated with Mattermost Boards plugin.
          </Text>
          <Text style={paragraph}>
            We are excited to have you on board! We hope our app helps you save time and stay on top of your schedule.
          </Text>
          <Section style={btnContainer}>
            <Button pX={14} pY={10} style={button} href={env.NEXT_PUBLIC_WEBAPP_URL}>
              Get started
            </Button>
          </Section>
          <Text style={paragraph}>
            See you soon,
            <br />
            {env.NEXT_PUBLIC_APP_NAME} Team
          </Text>
        </Container>
      </Section>
    </Html>
  );
}

export default Welcome;

const fontFamily =
  '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';

const main = {
  backgroundColor: '#ffffff',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
};

const logo = {
  margin: '0 auto',
};

const paragraph = {
  fontFamily,
  fontSize: '16px',
  lineHeight: '26px',
};

const btnContainer = {
  textAlign: 'center' as const,
};

const button = {
  fontFamily,
  backgroundColor: blue['500'],
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
};
