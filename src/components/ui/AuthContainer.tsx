import classNames from "classnames";
import Head from "next/head";
import { env } from "~/env.mjs";
import Logo from "./Logo";

interface Props {
  title: string;
  description: string;
  footerText?: React.ReactNode | string;
  showLogo?: boolean;
  heading?: string;
  loading?: boolean;
}

export default function AuthContainer(props: React.PropsWithChildren<Props>) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#f3f4f6] py-12 sm:px-6 lg:px-8">
      <Head>
        <title>{`${props.title} | ${env.NEXT_PUBLIC_APP_NAME}`}</title>
      </Head>
      {props.showLogo && <Logo size="lg" className="mb-auto" />}

      <div
        className={classNames(
          props.showLogo ? "text-center" : "",
          "sm:mx-auto sm:w-full sm:max-w-md"
        )}
      >
        {props.heading && (
          <h2 className="font-semibold tracking-tight transition-colors first:mt-0 text-center text-3xl text-gray-900">
            {props.heading}
          </h2>
        )}
      </div>
      <div className="mb-auto mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-2 rounded-md border border-gray-200 bg-white px-4 py-10 sm:px-10">
          {props.children}
        </div>
        <div className="mt-8 text-center text-sm text-gray-600">
          {props.footerText}
        </div>
      </div>
    </div>
  );
}
