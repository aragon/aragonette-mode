import { RootContextProvider } from "@/context";
import { Layout } from "@/components/layout";
import AlertContainer from "@/components/alert/alert-container";
import { PUB_APP_NAME, PUB_APP_DESCRIPTION, PUB_SOCIAL_IMAGE, PUB_BASE_URL, PUB_X_HANDLE } from "@/constants";
import Head from "next/head";
import "@aragon/ods/index.css";
import "@/pages/globals.css";
import { DevTools } from "@/plugins/stake/components/dev-tools";

export default function App({ Component, pageProps }: any) {
  return (
    <div>
      <Head>
        <title>{PUB_APP_NAME}</title>
        <meta property="description" content={PUB_APP_DESCRIPTION} />
        <meta property="og:title" content={PUB_APP_NAME} />
        <meta property="og:description" content={PUB_APP_DESCRIPTION} />
        <meta property="og:url" content={PUB_BASE_URL} />
        <meta property="og:site_name" content={PUB_APP_NAME} />
        <meta property="og:locale" content="en_US" />
        {PUB_SOCIAL_IMAGE ? <meta property="og:image" content={PUB_SOCIAL_IMAGE} /> : null}
        <meta property="og:image:alt" content="Mode Governance Hub" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PUB_APP_NAME} />
        <meta name="twitter:description" content={PUB_APP_DESCRIPTION} />
        {PUB_SOCIAL_IMAGE ? <meta name="twitter:image" content={PUB_SOCIAL_IMAGE} /> : null}
        <meta name="twitter:site" content={PUB_X_HANDLE} />
      </Head>
      <RootContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <AlertContainer />
        <DevTools />
      </RootContextProvider>
    </div>
  );
}
