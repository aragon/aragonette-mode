import { RootContextProvider } from "@/context";
import { Layout } from "@/components/layout/layout";
import AlertContainer from "@/components/alert/alert-container";
import { Manrope } from "next/font/google";
import "@aragon/ods/index.css";
import "@/pages/globals.css";
import { PUB_APP_NAME } from "@/constants";
import Head from "next/head";
import { HydrationBoundary } from "@tanstack/react-query";

const manrope = Manrope({
  subsets: ["latin"],
});

export default function AragonetteApp({ Component, pageProps }: any) {
  return (
    <div className={manrope.className}>
      <Head>
        <title>{PUB_APP_NAME}</title>
      </Head>
      <RootContextProvider>
        <Layout>
          <HydrationBoundary state={pageProps.dehydratedState}>
            <Component {...pageProps} />
          </HydrationBoundary>
        </Layout>
        <AlertContainer />
      </RootContextProvider>
    </div>
  );
}
