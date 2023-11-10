import { type AppProps as NextAppProps } from "next/app";
import { type NextRouter } from "next/router";
import { type Session } from "next-auth";
import { type ReactNode } from "react";
import { pl } from "date-fns/locale";
import { SessionProvider } from "next-auth/react";
import setDefaultOptions from "date-fns/setDefaultOptions";

import { Toaster } from "~/components/ui/Toaster";
import { api } from "~/utils/api";

import "~/styles/globals.css";

setDefaultOptions({ locale: pl });

export type NextPageWithLayout = NextAppProps["Component"] & {
  getLayout?: (page: React.ReactElement, router: NextRouter) => ReactNode;
};

// Workaround for https://github.com/vercel/next.js/issues/8592
export type AppProps = Omit<
  NextAppProps<Record<string, unknown> & { session: Session | null }>,
  "Component"
> & {
  Component: NextPageWithLayout;

  /** Will be defined only is there was an error */
  err?: Error;
};

export type AppPropsWithChildren = AppProps & {
  children: ReactNode;
};

const MyApp = ({
  router,
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SessionProvider session={session}>
      {getLayout(<Component {...pageProps} />, router)}
      <Toaster />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
