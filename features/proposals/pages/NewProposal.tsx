import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, InputText, TextAreaRichText } from "@aragon/ods";
import classNames from "classnames";
import { useCreateSnapshotProposal } from "@/plugins/snapshot/hooks/useCreateSnapshotProposal";
import { EMAIL_PATTERN, URL_PATTERN, URL_WITH_PROTOCOL_PATTERN } from "@/utils/input-values";

const UrlRegex = new RegExp(URL_PATTERN);
const EmailRegex = new RegExp(EMAIL_PATTERN);
const UrlWithProtocolRegex = new RegExp(URL_WITH_PROTOCOL_PATTERN);

// defined by Snapshot
const MAX_BODY_CHAR_COUNT = 10000;

// Because output is HTML, 7 chars are taken up by default
// for paragraph tags
const CHAR_OFFSET = 7;

export default function NewProposal() {
  const {
    control,
    setValue,
    getValues,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof ProposalCreationSchema>>({
    resolver: zodResolver(ProposalCreationSchema),
    mode: "onTouched",
    defaultValues: { title: "", body: "" },
  });

  const { createProposal } = useCreateSnapshotProposal();

  const handleCreateProposal = async (values: z.infer<typeof ProposalCreationSchema>) => {
    createProposal(new Date(), new Date(), values.title, values.body, values.discussion);
  };

  const addProtocolToLink = () => {
    const value = getValues("discussion");

    if (value && UrlRegex.test(value) && !EmailRegex.test(value) && !UrlWithProtocolRegex.test(value)) {
      setValue("discussion", `http://${value}`);
    }
  };

  return (
    <main className="mx-auto flex max-w-[720px] flex-col gap-y-16 px-4 pb-20 pt-10 md:px-6">
      <InputText
        label="Title"
        maxLength={50}
        helpText="Give your proposal a title"
        {...register("title")}
        {...(errors.title?.message
          ? {
              variant: "critical",
              alert: { variant: "critical", message: errors.title.message },
              "aria-invalid": "true",
            }
          : {})}
      />
      <Controller
        name="body"
        control={control}
        render={({ field }) => {
          const charCount = field.value?.length ? field.value.length - CHAR_OFFSET : 0;
          return (
            <div className="flex flex-col gap-y-3">
              <TextAreaRichText
                label="Description"
                helpText="Add a description for your proposal"
                onChange={field.onChange}
                value={field.value}
                onBlur={field.onBlur}
                isOptional={true}
                {...(errors.body?.message
                  ? {
                      variant: "critical",
                      alert: { variant: "critical", message: errors.body.message },
                      "aria-invalid": "true",
                    }
                  : {})}
              />
              {!errors.body?.message && (
                <p
                  className={classNames("text-xs font-normal leading-tight text-neutral-500 md:text-sm", {
                    "animate-shake": charCount === MAX_BODY_CHAR_COUNT + CHAR_OFFSET,
                  })}
                >
                  {charCount}/{MAX_BODY_CHAR_COUNT}
                </p>
              )}
            </div>
          );
        }}
      />

      <InputText
        label="Discussion"
        helpText="Add a link to where the proposal discussion took place"
        isOptional={true}
        {...register("discussion")}
        onBlur={(e) => {
          addProtocolToLink();
          register("discussion").onBlur(e);
        }}
        {...(errors.discussion?.message
          ? {
              variant: "critical",
              alert: { variant: "critical", message: errors.discussion?.message },
              "aria-invalid": "true",
            }
          : {})}
      />

      <span>
        <Button variant="primary" size="lg" className="!rounded-full" onClick={handleSubmit(handleCreateProposal)}>
          Create proposal
        </Button>
      </span>
    </main>
  );
}

// form title, body, start time, end time
export const ProposalCreationSchema = z.object({
  title: z.string().min(1, { message: "Proposal title is required" }),
  body: z
    .string()
    .max(MAX_BODY_CHAR_COUNT + CHAR_OFFSET, { message: "Proposal body should not exceed the 10,000 characters" })
    .optional(),
  discussion: z
    .string()
    .optional()
    .refine((val) => !val || UrlRegex.test(val) || z.string().email().safeParse(val).success, {
      message: "Invalid discussion link",
    }),
});
