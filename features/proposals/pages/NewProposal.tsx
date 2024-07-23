import { DateTimeErrors } from "@/components/dateTimeSelector/dateTimeErrors";
import DateTimeSelector from "@/components/dateTimeSelector/dateTimeSelector";
import Duration from "@/components/dateTimeSelector/duration";
import { Proposals } from "@/components/nav/routes";
import { useCreateProposal } from "@/plugins/multisig/hooks/useCreateProposal";
import { AlertInline, Button, Heading, InputText, RadioCard, RadioGroup, Switch, TextArea } from "@aragon/ods";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useAccount } from "wagmi";
import { HeaderProposalCreate } from "../components/headerNewProposal/headerNewProposal";
import { DraftProposalSelection } from "../components/newProposalForm/draftProposalSelection";
import { EmergencyContent } from "../components/newProposalForm/emergencyContent";
import { FormItem } from "../components/newProposalForm/formItem";
import { ProposalCategory } from "../components/newProposalForm/proposalCategory";
import {
  ActionType,
  durationSwitchValues,
  type ICreateProposalMetadataFormData,
  type ProposalCreationFormData,
  ProposalCreationFormDefaultValues,
  ProposalCreationSchema,
  startSwitchValues,
} from "../components/newProposalForm/types";
import { getProposalDates } from "../components/newProposalForm/utils";
import { proposalService } from "../services";

// todo: get dynamic settings
export default function NewProposal() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const formValues = useForm<ProposalCreationFormData>({
    resolver: zodResolver(ProposalCreationSchema),
    mode: "onTouched",
    defaultValues: ProposalCreationFormDefaultValues,
  });

  const { control, getValues, setValue, reset, handleSubmit } = formValues;

  const [actionType, isEmergency, pipSelected, resources, startSwitch, durationSwitch] = useWatch({
    control,
    name: ["actionType", "emergency", "pipSelected", "resources", "startSwitch", "durationSwitch"],
  });

  const [indexingStatus, setIndexingStatus] = useState<"idle" | "pending" | "success">("idle");

  const onProposalSubmitted = useCallback(async () => {
    setIndexingStatus("pending");
    const response = await proposalService.invalidateProposals();
    setIndexingStatus("success");

    if (response) {
      router.push(Proposals.path);
    }
  }, [router]);

  const { submitProposal, isConfirming, isAwaitingConfirmation } = useCreateProposal(onProposalSubmitted);

  const handleCreateProposal = async (values: ProposalCreationFormData) => {
    const { title, summary, description, emergency, type, resources } = values;

    const params = {
      metadata: {
        title,
        summary,
        description,
        type,
        resources: Object.values(resources).flatMap((r) => (!r.link || !r.name ? [] : { name: r.name, url: r.link })),
      },
      emergency,
      ...getProposalDates(getValues()),
    };

    await submitProposal(params);
  };

  const handlePipSelected = (pip: ICreateProposalMetadataFormData) => {
    setValue("title", pip.title);
    setValue("summary", pip.summary);
    setValue("description", pip.description);
    setValue("resources", pip.resources);
    setValue("type", pip.type);
    setValue("pipSelected", true);
  };

  const getButtonLabel = () => {
    if (!isConnected) {
      return "Connect to submit proposal";
    } else if (isAwaitingConfirmation) {
      return "Awaiting confirmation...";
    } else if (isConfirming) {
      return "Submitting proposal...";
    } else if (indexingStatus === "pending") {
      return "Indexing proposal...";
    } else {
      return "Submit proposal";
    }
  };

  const isAutoFill = !isEmergency && pipSelected;
  const minDurationMills = 1 * 60 * 60 * 1000;

  return (
    <FormProvider {...formValues}>
      <HeaderProposalCreate />
      <main className="mx-auto flex max-w-[720px] flex-col gap-y-16 px-4 pb-20 pt-10 md:px-6">
        {/* Content */}
        <div className="flex flex-col gap-y-6">
          <Heading size="h2">Content</Heading>
          <div className="flex flex-col gap-y-4">
            <FormItem
              id="emergency"
              label="Emergency proposal"
              helpText="Is this proposal a critical one, where you want to pass the community voting?"
            >
              <Switch
                label={isEmergency ? "Yes" : "No"}
                checked={isEmergency}
                onCheckedChanged={(value) => {
                  reset({ emergency: value });
                }}
              />
            </FormItem>
          </div>

          {!isEmergency && <DraftProposalSelection onPIPSelected={handlePipSelected} />}
          {isEmergency && <EmergencyContent control={control} />}
        </div>
        <div className="flex flex-col gap-y-6">
          {/* Category */}
          <ProposalCategory isAutoFill={isAutoFill} control={control} />
          <div className="flex flex-col gap-y-4">
            <FormItem
              id="startDate"
              label="Start date"
              helpText="Define when a proposal should be active to receive approvals. If now is selected, the proposal is immediately active after publishing."
            >
              <Controller
                control={control}
                name="startSwitch"
                render={({ field: { onChange, ...rest } }) => (
                  <RadioGroup id="action-group" className="gap-x-6 sm:!flex-row" {...rest} onValueChange={onChange}>
                    {startSwitchValues.map((v) => (
                      <RadioCard key={v.label} label={v.label} value={v.value} description="" className="flex-1" />
                    ))}
                  </RadioGroup>
                )}
              />
            </FormItem>

            {startSwitch === "date" && (
              <>
                <DateTimeSelector
                  mode="start"
                  defaultDateOffset={{ minutes: 10 }}
                  minDurationAlert={"Duration cannot be less than one hour."}
                  minDurationMills={minDurationMills}
                  onUtcClicked={() => {}}
                />
                <DateTimeErrors mode="start" />
              </>
            )}
          </div>

          <div className="flex flex-col gap-y-4">
            <FormItem
              id="expirationDate"
              label="Expiration date"
              helpText="Define when a proposal should expire. After the expiration time, there is no way to approve or execute the proposal."
            >
              <Controller
                control={control}
                name="durationSwitch"
                render={({ field: { onChange, ...rest } }) => (
                  <RadioGroup id="action-group" className="gap-x-6 sm:!flex-row" {...rest} onValueChange={onChange}>
                    {durationSwitchValues.map((v) => (
                      <RadioCard key={v.label} label={v.label} value={v.value} description="" className="flex-1" />
                    ))}
                  </RadioGroup>
                )}
              />
            </FormItem>

            {durationSwitch === "duration" && <Duration />}
            <AlertInline message="The minimum duration for each PIP is 4 weeks." variant="info" />
          </div>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-y-6">
          <Heading size="h2">Resources</Heading>
          <Controller
            name="resources.forum.link"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputText
                label="Discussion"
                isOptional={true}
                helpText={
                  isAutoFill && !!resources?.forum?.link
                    ? "This link is automatically added based on your Github proposal selection."
                    : "Add the forum link, so everybody can view the discussion."
                }
                disabled={isAutoFill && !!resources?.forum?.link}
                // addon="https://"
                {...field}
                {...(error?.message
                  ? { alert: { variant: "critical", message: error.message }, variant: "critical" }
                  : {})}
              />
            )}
          />
          {isEmergency && (
            <Controller
              name="resources.transparencyReport.link"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <InputText
                  label="Council transparency report"
                  isOptional={true}
                  helpText={
                    isAutoFill && !!resources?.transparencyReport?.link
                      ? "This link is automatically added based on your Github proposal selection."
                      : "Add the transparency report link for this proposal."
                  }
                  disabled={isAutoFill && !!resources?.transparencyReport?.link}
                  // addon="https://"
                  {...field}
                  {...(error?.message
                    ? { alert: { variant: "critical", message: error.message }, variant: "critical" }
                    : {})}
                />
              )}
            />
          )}
          {isAutoFill && (
            <Controller
              name="resources.github.link"
              control={control}
              render={({ field }) => (
                <InputText
                  label="Github PIP"
                  helpText="This link is automatically added based on your Github proposal selection."
                  disabled={true}
                  // addon="https://"
                  {...field}
                />
              )}
            />
          )}
        </div>
        {/* Actions */}
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-3">
            <Heading size="h2">Actions</Heading>
            <p className="text-lg text-neutral-500">
              Define if this proposal is just an signalling or includes binding onchain execution, which are able to be
              executed after each voting stage has accepted the proposal.
            </p>
          </div>
          <div className="flex flex-col gap-y-3">
            <label htmlFor="action-group">
              <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg">Select type</p>
            </label>
            <Controller
              control={control}
              name="actionType"
              render={({ field: { onChange, ...rest } }) => (
                <RadioGroup
                  id="action-group"
                  className="gap-x-6 sm:!flex-row"
                  {...rest}
                  onValueChange={(value) => onChange(value)}
                >
                  {Object.entries(ActionType).map(([key, value]) => (
                    <RadioCard key={key} label={value} value={value} description="" className="flex-1" />
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          {actionType === ActionType.Upload && (
            <Controller
              control={control}
              name="bytecode"
              render={({ field, fieldState: { error } }) => (
                <TextArea
                  label="Action bytecode"
                  helpText="Paste the action bytecode"
                  placeholder="Adding secondary validator..."
                  {...field}
                  {...(error?.message
                    ? { alert: { variant: "critical", message: error.message }, variant: "critical" }
                    : {})}
                />
              )}
            />
          )}
        </div>
        <span>
          <Button
            onClick={handleSubmit(handleCreateProposal)}
            className="!rounded-full"
            isLoading={isConfirming || isAwaitingConfirmation || indexingStatus === "pending"}
            disabled={!isConnected}
          >
            {getButtonLabel()}
          </Button>
        </span>
      </main>
    </FormProvider>
  );
}
