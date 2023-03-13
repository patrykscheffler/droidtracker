export default function Logo({ small }: { small?: boolean }) {
  return (
    <h3 className="logo inline-flex justify-center leading-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="h-5 w-auto" alt="ClonoChron" title="ClonoChron" src="/images/logo.svg" />
      {!small && <strong className="ml-2">
        ClonoChrone
      </strong>}
    </h3>
  );
}
