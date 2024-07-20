import { MemberProfile } from "@/components/nav/routes";
import { useAnnounceDelegation } from "@/plugins/delegateAnnouncer/hooks/useAnnounceDelegation";
import { type IDelegationWallMetadata } from "@/plugins/delegateAnnouncer/utils/types";
import {
  EMAIL_PATTERN,
  EMPTY_HTML_PARAGRAPH_PATTERN,
  URL_PATTERN,
  URL_WITH_PROTOCOL_PATTERN,
} from "@/utils/input-values";
import {
  Button,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  Dropdown,
  IconType,
  InputText,
  Tag,
  TextArea,
  TextAreaRichText,
  type IDialogRootProps,
} from "@aragon/ods";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod";

const DELEGATE_RESOURCES = "resources";

const UrlRegex = new RegExp(URL_PATTERN);
const EmailRegex = new RegExp(EMAIL_PATTERN);
const UrlWithProtocolRegex = new RegExp(URL_WITH_PROTOCOL_PATTERN);
const EmptyParagraphRegex = new RegExp(EMPTY_HTML_PARAGRAPH_PATTERN);

const ResourceSchema = z
  .object({
    name: z.string().optional(),
    link: z
      .string()
      .optional()
      .refine((val) => !val || UrlRegex.test(val) || z.string().email().safeParse(val).success, {
        message: "Invalid resource link",
      }),
  })
  .refine(
    (data) => !!(data.name && data.link) || !!(!data.name && !data.link),
    (data) => ({
      message: `A ${data.name ? "Link" : "Name"} is required`,
      path: data.name ? ["link"] : ["name"],
    })
  );

const MetadataSchema = z.object({
  identifier: z.string().min(1, { message: "Identifier is required" }),
  bio: z.string().min(1, { message: "A short bio is required" }),
  message: z.string().regex(EmptyParagraphRegex, { message: "Delegation statement is required" }),
  resources: z.array(ResourceSchema).optional(),
});

interface IDelegateAnnouncementDialogProps extends IDialogRootProps {
  onClose: () => void;
  defaultValues?: z.infer<typeof MetadataSchema>;
}

export const DelegateAnnouncementDialog: React.FC<IDelegateAnnouncementDialogProps> = (props) => {
  const { onClose, defaultValues, ...otherProps } = props;

  const router = useRouter();
  const { address } = useAccount();

  const {
    control,
    getValues,
    setValue,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<z.infer<typeof MetadataSchema>>({
    resolver: zodResolver(MetadataSchema),
    mode: "onTouched",
    defaultValues: defaultValues ?? { bio: "", message: "<p></p>", resources: [{ name: "", link: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ name: DELEGATE_RESOURCES, control });

  const addProtocolToLink = (index: number) => {
    const linkName = `${DELEGATE_RESOURCES}.${index}.link` as const;
    const value = getValues(linkName) ?? "";

    if (UrlRegex.test(value) && !EmailRegex.test(value) && !UrlWithProtocolRegex.test(value)) {
      setValue(linkName, `http://${value}`);
    }
  };

  const handleAnnouncement = async (values: z.infer<typeof MetadataSchema>) => {
    announceDelegation({
      ...values,
      resources: values.resources?.filter((r) => !!r.link && !!r.name) as IDelegationWallMetadata["resources"],
    });
  };

  const handleOnClose = () => {
    reset();
    onClose();
  };

  const onSuccessfulAnnouncement = () => {
    setTimeout(() => {
      router.push(MemberProfile.getPath(address!));
    }, 2000);
  };

  const { isConfirming, awaitingConfirmation, announceDelegation } = useAnnounceDelegation(onSuccessfulAnnouncement);

  const getCtaLabel = () => {
    if (isConfirming) {
      return "Submitting profile";
    } else if (awaitingConfirmation) {
      return "Awaiting confirmation";
    } else return defaultValues ? "Update profile" : "Create profile";
  };

  return (
    <DialogRoot {...otherProps} containerClassName="!max-w-[520px]">
      <DialogHeader
        title={defaultValues ? "Update your delegate profile" : "Create your delegate profile"}
        onCloseClick={handleOnClose}
        onBackClick={handleOnClose}
      />
      <DialogContent className="flex flex-col gap-y-4 md:gap-y-6">
        <InputText
          label="Identifier"
          readOnly={isConfirming}
          helpText="This will be shown on the delegate profile list."
          placeholder="Name, ENS name, Privado ID, etc."
          aria-invalid={errors.identifier ? "true" : "false"}
          {...register("identifier")}
          {...(errors.identifier?.message
            ? { alert: { variant: "critical", message: errors.identifier.message } }
            : {})}
        />
        <TextArea
          label="Bio"
          helpText="Brief description of who you are and your relevant experiences"
          placeholder="2-3 sentences describing who you are and your relevant experiences"
          {...register("bio")}
          maxLength={400}
          readOnly={isConfirming}
          aria-invalid={errors.bio ? "true" : "false"}
          alert={errors.bio?.message ? { variant: "critical", message: errors.bio.message } : undefined}
        />
        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <TextAreaRichText
              helpText="A statement explaining your motivation for becoming a delegate"
              label="Delegation statement"
              onChange={field.onChange}
              value={field.value}
              onBlur={field.onBlur}
              aria-invalid={errors.message ? "true" : "false"}
              alert={errors.message?.message ? { variant: "critical", message: errors.message.message } : undefined}
            />
          )}
        />

        <div className="flex flex-col gap-y-2 md:gap-y-3">
          <div className="flex flex-col gap-0.5 md:gap-1">
            <div className="flex gap-x-3">
              <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg">Resources</p>
              <Tag label={"Optional"} />
            </div>
            <p className="text-sm font-normal leading-normal text-neutral-500 md:text-base">
              Share external resources here
            </p>
          </div>

          {fields.length > 0 && (
            <div className="flex flex-col gap-y-4 rounded-xl border border-neutral-100 bg-neutral-0 px-3 py-1 md:px-4 md:py-2">
              {fields.map((field, index) => {
                const { name: nameError, link: linkError } = errors[DELEGATE_RESOURCES]?.[index] ?? {};

                return (
                  <div key={field.id} className="flex flex-col gap-y-3 py-3 md:py-4">
                    <div className="flex items-end gap-x-3">
                      <InputText
                        label="Name / Description"
                        readOnly={isConfirming}
                        placeholder="GitHub, Twitter, etc."
                        aria-invalid={nameError ? "true" : "false"}
                        {...register(`${DELEGATE_RESOURCES}.${index}.name` as const)}
                        {...(nameError?.message ? { alert: { variant: "critical", message: nameError.message } } : {})}
                      />
                      {fields.length > 1 && (
                        <Dropdown.Container
                          align="end"
                          customTrigger={<Button size="lg" variant="tertiary" iconLeft={IconType.DOTS_VERTICAL} />}
                        >
                          <Dropdown.Item
                            onClick={() => {
                              remove(index);
                            }}
                          >
                            Remove link
                          </Dropdown.Item>
                        </Dropdown.Container>
                      )}
                    </div>
                    <InputText
                      label="Link"
                      placeholder="https://..."
                      readOnly={isConfirming}
                      {...register(`${DELEGATE_RESOURCES}.${index}.link` as const)}
                      onBlur={(e) => {
                        register(`${DELEGATE_RESOURCES}.${index}.link` as const).onBlur(e);
                        addProtocolToLink(index);
                      }}
                      aria-invalid={linkError ? "true" : "false"}
                      {...(linkError?.message ? { alert: { variant: "critical", message: linkError.message } } : {})}
                    />
                  </div>
                );
              })}
            </div>
          )}
          <span className="mt-1">
            <Button
              variant="tertiary"
              size="lg"
              className="!rounded-full"
              iconLeft={IconType.PLUS}
              onClick={() => {
                append({ link: "", name: "" });
              }}
            >
              Add resource
            </Button>
          </span>
        </div>
        <div className="mt-4 flex justify-between">
          <Button
            variant="primary"
            size="lg"
            className="!rounded-full"
            isLoading={isConfirming || awaitingConfirmation}
            onClick={handleSubmit(handleAnnouncement)}
          >
            {getCtaLabel()}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="!rounded-full"
            onClick={handleOnClose}
            disabled={isConfirming || awaitingConfirmation}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
      <DialogFooter />
    </DialogRoot>
  );
};
