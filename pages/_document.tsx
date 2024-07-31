import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon-32x32.png" sizes="any" />
      </Head>
      <body className="bg-neutral-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
