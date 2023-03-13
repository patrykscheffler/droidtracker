import { Check } from "lucide-react";

import { Button } from "~/components/ui/Button";
import AuthContainer from "~/components/ui/AuthContainer";
import Link from "next/link";

function Logout() {
  return (
    <AuthContainer
      showLogo
      title="Logged out"
      description="You have been logged out"
    >
      <div className="mb-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
            You have been logged out
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Hope to see you soon</p>
          </div>
        </div>
      </div>
      <Link href="/auth/login">
        <Button className="flex w-full justify-center">
          Go back to login page
        </Button>
      </Link>
    </AuthContainer>
  );
}

export default Logout;
