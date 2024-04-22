import { RootContextProvider } from "@/context";
import { Layout } from "@/components/layout/layout";
import AlertContainer from "@/components/alert/alert-container";
import localFont from "next/font/local";
import "@aragon/ods/index.css";
import "@/pages/globals.css";
import { PUB_APP_NAME } from "@/constants";
import Head from "next/head";
import { HydrationBoundary } from "@tanstack/react-query";

const generalSans = localFont({
  src: [
    {
      path: "../public/fonts/GeneralSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/GeneralSans-Medium.woff2",
      weight: "600",
      style: "normal",
    },
  ],
});

export default function AragonetteApp({ Component, pageProps }: any) {
  return (
    <>
      {
        <style jsx={true} global={true}>{`
          html {
            font-family: ${generalSans.style.fontFamily};
          }
        `}</style>
      }
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
    </>
  );
}
