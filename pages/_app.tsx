import { RootContextProvider } from "@/context";
import { Layout } from "@/components/layout/layout";
import AlertContainer from "@/components/alert/alert-container";
import localFont from "next/font/local";
import "@aragon/ods/index.css";
import "@/pages/globals.css";
import { PUB_API_BASE_URL, PUB_APP_DESCRIPTION, PUB_APP_NAME, PUB_BASE_URL, PUB_X_HANDLE } from "@/constants";
import Head from "next/head";
import { HydrationBoundary } from "@tanstack/react-query";

const generalSans = localFont({
  src: [
    {
      path: "../public/fonts/ibm/IBMPlexSans-Light.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/ibm/IBMPlexSans-Medium.ttf",
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
        <meta property="description" content={PUB_APP_DESCRIPTION} />
        <meta property="og:title" content={PUB_APP_NAME} />
        <meta property="og:description" content={PUB_APP_DESCRIPTION} />
        <meta property="og:url" content={PUB_BASE_URL} />
        <meta property="og:site_name" content={PUB_APP_NAME} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content={`${PUB_API_BASE_URL}/og`} />
        <meta property="og:image:alt" content="Mode Governance Hub" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PUB_APP_NAME} />
        <meta name="twitter:description" content={PUB_APP_DESCRIPTION} />
        <meta name="twitter:image" content={`${PUB_API_BASE_URL}/og`} />
        <meta name="twitter:site" content={PUB_X_HANDLE} />
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
