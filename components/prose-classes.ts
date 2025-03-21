import classNames from "classnames";

export const proseClasses = classNames(
  "prose-p:text-base prose-p:md:text-lg", //prose-p
  "prose-a:text-primary-400 prose-a:no-underline prose-a:hover:text-primary-600 prose-a:active:text-primary-800", // prose-a
  "prose-strong:text-base prose-strong:md:text-lg prose-strong:text-neutral-500", // prose-strong
  "prose-em:text-base prose-em:md:text-lg prose-em:text-neutral-500", //em
  "prose-blockquote:rounded-lg prose-blockquote:border prose-blockquote:border-neutral-200 prose-blockquote:bg-neutral-50 prose-blockquote:prose-p-10 prose-blockquote:shadow-md", // blockquote
  "prose-pre:rounded-lg prose-pre:bg-neutral-900 prose-pre:text-neutral-50", //pre
  "prose-code:bg-neutral-900 prose-code:text-neutral-50 prose-code:text-sm prose-code:py-1 prose-code:px-1 prose-code:rounded prose-code:font-normal", //code
  "prose-img:overflow-hidden prose-img:rounded-xl prose-img:shadow-md", // img
  "prose-video:overflow-hidden prose-video:rounded-xl prose-video:shadow-md", // video
  "prose-hr:mt-10 prose-hr:border-neutral-200", // hr
  "prose-lead:text-neutral-600",
  "prose-headings:text-neutral-800 prose-headings:leading-tight text-neutral-500 prose-headings:font-normal"
);
