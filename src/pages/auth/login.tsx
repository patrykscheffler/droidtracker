import type { GetServerSidePropsContext } from "next";
import {
  getProviders,
  signIn,
  getSession,
  getCsrfToken,
} from "next-auth/react";

import { Button } from "~/components/ui/Button";
import Mattermost from "~/components/ui/icons/Mattermost";
import AuthContainer from "~/components/ui/AuthContainer";

function login() {
  return (
    <AuthContainer
      title="Login"
      description="Login"
      showLogo
      heading="Welcome back"
    >
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={async (e) => {
            e.preventDefault();
            await signIn("mattermost");
          }}
        >
          <Mattermost className="mr-2 h-6 w-6" /> Sign in with Mattermost
        </Button>
      </div>
    </AuthContainer>
  );
}

export default login;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  const csrfToken = await getCsrfToken(context);
  const providers = await getProviders();
  if (session) {
    return {
      redirect: { destination: "/" },
    };
  }
  return {
    props: {
      csrfToken,
      providers,
    },
  };
}
