import classNames from "classnames";
import {
  CalendarClock,
  Clock,
  type LucideIcon,
  Settings,
  MoreVertical,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { type NextRouter, useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import useMeQuery from "~/lib/hooks/useMeQuery";
import { api } from "~/utils/api";
import ErrorBoundary from "../ui/ErrorBoundary";
import Logo from "../ui/Logo";

export function useRedirectToLoginIfUnauthenticated(isPublic = false) {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const router = useRouter();

  useEffect(() => {
    if (isPublic) {
      return;
    }

    if (!loading && !session) {
      void router.replace({
        pathname: "/auth/login",
        query: {
          callbackUrl: `${location.pathname}${location.search}`,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session, isPublic]);

  return {
    loading: loading && !session,
    session,
  };
}

const defaultIsCurrent: NavigationItemType["isCurrent"] = ({
  isChild,
  item,
  router,
}) => {
  return isChild
    ? item.href === router.asPath
    : router.asPath.startsWith(item.href);
};

const NavigationItem: React.FC<{
  item: NavigationItemType;
  index?: number;
  isChild?: boolean;
}> = (props) => {
  const { item, isChild } = props;
  const router = useRouter();
  const isCurrent: NavigationItemType["isCurrent"] =
    item.isCurrent || defaultIsCurrent;
  const current = isCurrent({ isChild: !!isChild, item, router });

  return (
    <>
      <Link
        href={item.href}
        className={classNames(
          "group flex items-center rounded-md py-2 px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 [&[aria-current='page']]:bg-gray-200 [&[aria-current='page']]:hover:text-gray-900",
          isChild
            ? `[&[aria-current='page']]:text-brand-900 hidden h-8 pl-16 lg:flex lg:pl-11 [&[aria-current='page']]:bg-transparent ${
                props.index === 0 ? "mt-0" : "mt-px"
              }`
            : "[&[aria-current='page']]:text-brand-900 mt-0.5 text-sm"
        )}
        aria-current={current ? "page" : undefined}
      >
        {item.icon && (
          <item.icon
            className="mr-2 h-4 w-4 flex-shrink-0 text-gray-500 [&[aria-current='page']]:text-inherit"
            aria-hidden="true"
            aria-current={current ? "page" : undefined}
          />
        )}
        <span className="hidden w-full justify-between lg:flex">
          <div className="flex">{item.name}</div>
        </span>
      </Link>
    </>
  );
};

function UserDropdown({ small }: { small?: boolean }) {
  const { data: user } = useMeQuery();

  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <DropdownMenu open={menuOpen}>
      <div className="sm:-ml-5">
        <DropdownMenuTrigger
          asChild
          onClick={() => setMenuOpen((menuOpen) => !menuOpen)}
        >
          <button className="radix-state-open:bg-gray-200 group mx-0 flex w-full cursor-pointer appearance-none items-center rounded-full p-2 text-left outline-none hover:bg-gray-200 focus:outline-none focus:ring-0 sm:mx-2.5 sm:pl-3 md:rounded-none lg:rounded lg:pl-2">
            <span
              className={classNames(
                small ? "h-6 w-6 md:ml-3" : "mr-2 h-8 w-8",
                "relative flex-shrink-0 rounded-full bg-gray-300 "
              )}
            >
              {/* {user.image && (
                <img
                  className="rounded-full"
                  src="/images/logo.png"
                />
              )} */}
            </span>
            {!small && (
              <span className="flex flex-grow items-center truncate">
                <span className="flex-grow truncate text-sm">
                  <span className="mb-1 block truncate font-medium leading-none text-gray-900">
                    {user.name || "Nameless user"}
                  </span>
                </span>
                <MoreVertical
                  className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500 ltr:mr-2 rtl:ml-2 rtl:mr-4"
                  aria-hidden="true"
                />
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
      </div>

      <DropdownMenuContent
        onInteractOutside={() => {
          setMenuOpen(false);
        }}
        className="overflow-hidden rounded-md"
      >
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/auth/logout" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type NavigationItemType = {
  name: string;
  href: string;
  icon?: LucideIcon;
  isCurrent?: ({
    item,
    isChild,
    router,
  }: {
    item: NavigationItemType;
    isChild?: boolean;
    router: NextRouter;
  }) => boolean;
};

const navigationItems: NavigationItemType[] = [
  {
    name: "Timer",
    href: "/",
    icon: Clock,
  },
  {
    name: "Availability",
    href: "/availability",
    icon: CalendarClock,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const Navigation = () => {
  return (
    <nav className="mt-2 flex-1 md:px-2 lg:mt-6 lg:px-0">
      {navigationItems.map((item) => (
        <NavigationItem key={item.name} item={item} />
      ))}
    </nav>
  );
};

function SideBarContainer() {
  const { status } = useSession();

  if (status !== "loading" && status !== "authenticated") return null;
  return <SideBar />;
}

function SideBar() {
  return (
    <div className="relative">
      <aside className="desktop-transparent top-0 hidden h-full max-h-screen w-14 flex-col overflow-y-auto overflow-x-hidden border-r border-gray-100 bg-gray-50 md:sticky md:flex lg:w-56 lg:px-4">
        <div className="flex h-full flex-col justify-between py-3 lg:pt-6 ">
          <header className="items-center justify-between md:hidden lg:flex">
            <Link href="/" className="px-2">
              <Logo />
            </Link>
          </header>

          {/* logo icon for tablet */}
          <Link href="/" className="text-center md:inline lg:hidden">
            <Logo small />
          </Link>

          <Navigation />
        </div>

        <div>
          <div data-testid="user-dropdown-trigger">
            <span className="hidden lg:inline">
              <UserDropdown />
            </span>
            <span className="hidden md:inline lg:hidden">
              <UserDropdown small />
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}

type LayoutProps = {
  children: React.ReactNode;
};

function MainContainer(props: LayoutProps) {
  return (
    <main className="relative z-0 flex-1 bg-white focus:outline-none">
      <div className="max-w-full py-4 px-4 md:py-8 lg:px-12">
        <ErrorBoundary>{props.children}</ErrorBoundary>
      </div>
    </main>
  );
}

export default function AppLayout(props: LayoutProps) {
  useRedirectToLoginIfUnauthenticated();
  const session = useSession();

  if (session.status === "loading") return <></>;

  return (
    <>
      <Head>
        <title>ClonoChron</title>
      </Head>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <SideBarContainer />
          <div className="flex w-0 flex-1 flex-col">
            <MainContainer {...props} />
          </div>
        </div>
      </div>
    </>
  );
}

export const getLayout = (page: React.ReactElement) => (
  <AppLayout>{page}</AppLayout>
);
