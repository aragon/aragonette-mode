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
        <meta property="description" content={PUB_APP_DESCRIPTION} key="description" />
        <meta property="og:title" content={PUB_APP_NAME} key="og:title" />
        <meta property="og:description" content={PUB_APP_DESCRIPTION} key="og:description" />
        <meta property="og:url" content={PUB_BASE_URL} key="og:url" />
        <meta property="og:site_name" content={PUB_APP_NAME} key="og:site_name" />
        <meta property="og:locale" content="en_US" key="og:locale" />
        <meta property="og:image" content={`${PUB_BASE_URL}/${PUB_API_BASE_URL}/og`} key="og:image" />
        <meta property="og:image:alt" content="Polygon Governance Hub logo" key="og:image:alt" />
        <meta property="og:type" content="website" key="og:type" />

        <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
        <meta name="twitter:title" content={PUB_APP_NAME} key="twitter:title" />
        <meta name="twitter:description" content={PUB_APP_DESCRIPTION} key="twitter:description" />
        <meta name="twitter:image" content={`${PUB_BASE_URL}/${PUB_API_BASE_URL}/og`} key="twitter:image" />
        <meta name="twitter:site" content={PUB_X_HANDLE} key="twitter:site" />
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
