import React, { createContext, useContext, useState, useEffect } from "react";
import Head from "next/head";

import { env } from "~/env.mjs";

type MetaType = {
  title: string;
  description?: string;
};

const initialMeta: MetaType = {
  title: env.NEXT_PUBLIC_APP_NAME,
  description: "",
};

const MetaContext = createContext({
  meta: initialMeta,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setMeta: (newMeta: Partial<MetaType>) => {},
});

export function useMeta() {
  return useContext(MetaContext);
}

export function MetaProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState(initialMeta);
  const setMeta = (newMeta: Partial<MetaType>) => {
    setValue((v) => ({ ...v, ...newMeta }));
  };

  return <MetaContext.Provider value={{ meta: value, setMeta }}>{children}</MetaContext.Provider>;
}

/**
 * The purpose of this component is to simplify title and description handling.
 * Similarly to `next/head`'s `Head` component this allow us to update the metadata for a page
 * from any children, also exposes the metadata via the `useMeta` hook in case we need them
 * elsewhere (ie. on a Heading, Title, Subtitle, etc.)
 * @example <Meta title="Password" description="Manage settings for your account passwords" />
 */
export default function Meta({ title, description }: MetaType) {
  const { setMeta, meta } = useMeta();

  useEffect(() => {
    if (meta.title !== title || meta.description !== description) {
      setMeta({ title, description });
    }
  }, [title, description]);

  const title_ = `${title} • ${env.NEXT_PUBLIC_APP_NAME}`;

  return (
    <Head>
      <title>{title_}</title>
      <meta name="description" content={description} />
    </Head>
  );
}
