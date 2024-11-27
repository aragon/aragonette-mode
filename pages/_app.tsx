import { RootContextProvider } from "@/context";
import { Layout } from "@/components/layout";
import AlertContainer from "@/components/alert/alert-container";
import { PUB_APP_NAME, PUB_APP_DESCRIPTION, PUB_BASE_URL, PUB_X_HANDLE, PUB_SOCIAL_IMAGE } from "@/constants";
import { NextSeo } from "next-seo";
import "@aragon/ods/index.css";
import "@/pages/globals.css";
import { DevTools } from "@/plugins/stake/components/dev-tools";

export default function App({ Component, pageProps }: any) {
  return (
    <div>
      <NextSeo
        title={PUB_APP_NAME}
        description={PUB_APP_DESCRIPTION}
        openGraph={{
          title: PUB_APP_NAME,
          description: PUB_APP_DESCRIPTION,
          url: PUB_BASE_URL,
          siteName: PUB_APP_NAME,
          locale: "en_US",
          type: "website",
          images: [
            {
              url: PUB_SOCIAL_IMAGE,
              width: 1200,
              height: 630,
              alt: PUB_APP_NAME,
            },
          ],
        }}
        twitter={{
          cardType: "summary_large_image",
          handle: PUB_X_HANDLE,
          site: PUB_APP_NAME,
        }}
      />
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
