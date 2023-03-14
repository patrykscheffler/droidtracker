import { env } from "~/env.mjs";

export default function Logo({ small }: { small?: boolean }) {
  return (
    <h3 className="logo inline-flex justify-center leading-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="h-5 w-auto"
        alt={env.NEXT_PUBLIC_APP_NAME}
        title={env.NEXT_PUBLIC_APP_NAME}
        src="/images/logo.svg"
      />
      {!small && <strong className="ml-2">{env.NEXT_PUBLIC_APP_NAME}</strong>}
    </h3>
  );
}
