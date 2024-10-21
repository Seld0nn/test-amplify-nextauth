import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import RootLayout from "~/layout/rootlayout";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <RootLayout>
      <SessionProvider session={session}>
        <div className={GeistSans.className}>
        <Component {...pageProps} />
        </div>
      </SessionProvider>
    </RootLayout>
  );
};

export default api.withTRPC(MyApp);


/*
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { MantineProvider } from "@mantine/core";
import App from "~/components/App";
import Head from "next/head";
import { ModalsProvider } from "@mantine/modals";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <MantineProvider>
      <ModalsProvider>
        <Head>
        <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
          />
        </Head>
        <div>
          <App>
            <Component {...pageProps} />
          </App>
        </div>
        </ModalsProvider>
      </MantineProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
*/