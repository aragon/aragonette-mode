import { MemberProfile } from "@/components/nav/routes";
import { useAnnounceDelegation } from "@/plugins/delegateAnnouncer/hooks/useAnnounceDelegation";
import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
import { type IDelegationWallMetadata } from "@/plugins/delegateAnnouncer/utils/types";
import { EMAIL_PATTERN, URL_PATTERN, URL_WITH_PROTOCOL_PATTERN } from "@/utils/input-values";
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
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod";

const DELEGATE_RESOURCES = "resources";

const UrlRegex = new RegExp(URL_PATTERN);
const EmailRegex = new RegExp(EMAIL_PATTERN);
const UrlWithProtocolRegex = new RegExp(URL_WITH_PROTOCOL_PATTERN);
const EmptyParagraphRegex = new RegExp(/^(?!<p><\/p>$).*/i);

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
    (data) => (data.name && data.link) || (!data.name && !data.link),
    (data) => ({
      message: `A ${data.name ? "Link" : "Name"} is required`,
      path: data.name ? ["link"] : ["name"],
    })
  );

const MetadataSchema = z.object({
  bio: z.string().min(1, { message: "A short bio is required" }),
  message: z.string().regex(EmptyParagraphRegex, { message: "Delegation statement is required" }),
  resources: z.array(ResourceSchema).optional(),
});

interface IDelegateAnnouncementDialogProps extends IDialogRootProps {
  onClose: () => void;
  onCreateProfile: (values: IDelegationWallMetadata) => void;
}

export const DelegateAnnouncementDialog: React.FC<IDelegateAnnouncementDialogProps> = (props) => {
  const { onClose, onCreateProfile, ...otherProps } = props;

  const router = useRouter();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { queryKey: announcementKey } = useAnnouncement(address, { enabled: false });

  const {
    control,
    getValues,
    setValue,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<z.infer<typeof MetadataSchema>>({
    resolver: zodResolver(MetadataSchema),
    mode: "onTouched",
    defaultValues: { bio: "", message: "<p></p>", resources: [{ name: "", link: "" }] },
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

  const onSuccessfulAnnouncement = () => {
    queryClient.invalidateQueries({ queryKey: [announcementKey], type: "all", exact: false });
    router.push(MemberProfile.getPath(address!));
  };

  const { isConfirming, status, announceDelegation } = useAnnounceDelegation(onSuccessfulAnnouncement);

  const ctaLabel = isConfirming ? "Creating profile" : "Create profile";

  return (
    <DialogRoot {...otherProps} containerClassName="!max-w-[520px]">
      <DialogHeader title="Create your delegation profile" onCloseClick={onClose} onBackClick={onClose} />
      <DialogContent className="flex flex-col gap-y-4 md:gap-y-6">
        <TextArea
          placeholder="Brief description of who you are and your relevant experiences"
          label="Bio"
          {...register("bio")}
          maxLength={400}
          alert={errors.bio?.message ? { variant: "critical", message: errors.bio.message } : undefined}
        />
        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <TextAreaRichText
              placeholder="A statement detailing what you bring to the DAO and why you should be delegated to"
              label="Delegation statement"
              onChange={field.onChange}
              value={field.value}
              onBlur={field.onBlur}
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

          <div className="flex flex-col gap-y-4 rounded-xl border border-neutral-100 bg-neutral-0 px-3 py-1 md:px-4 md:py-2">
            {fields.map((field, index) => {
              const { name: nameError, link: linkError } = errors[DELEGATE_RESOURCES]?.[index] ?? {};

              return (
                <div key={field.id} className="flex flex-col gap-y-3 py-3 md:py-4">
                  <div className="flex items-end gap-x-3">
                    <InputText
                      label="Name / Description"
                      placeholder="GitHub, Twitter, etc."
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
                    {...register(`${DELEGATE_RESOURCES}.${index}.link` as const)}
                    onBlur={(e) => {
                      register(`${DELEGATE_RESOURCES}.${index}.link` as const).onBlur(e);
                      addProtocolToLink(index);
                    }}
                    {...(linkError?.message ? { alert: { variant: "critical", message: linkError.message } } : {})}
                  />
                </div>
              );
            })}
          </div>
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
            isLoading={isConfirming}
            onClick={handleSubmit(handleAnnouncement)}
          >
            {ctaLabel}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="!rounded-full"
            onClick={onClose}
            disabled={isConfirming || status === "pending"}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
      <DialogFooter />
    </DialogRoot>
  );
};
