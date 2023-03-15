import Link from "next/link";

import { Button } from "~/components/ui/Button";

export default function Custom404() {
  return (
    <div className="min-h-screen bg-white px-4" data-testid="404-page">
      <main className="mx-auto max-w-xl pt-16 pb-6 sm:pt-24">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-black">
            Error 500
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-gray-900">
            It&apos;s not you, it&apos;s us.
          </h1>
        </div>
        <div className="mt-12 flex justify-center">
          <div className="mt-8">
            <Link
              href="/"
              className="text-base font-medium text-black hover:text-gray-500"
            >
              <Button>
                <span className="mr-2" aria-hidden="true">
                  &larr;{" "}
                </span>
                Go back
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
