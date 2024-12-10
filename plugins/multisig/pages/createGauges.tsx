import { Button, IconType, InputText, TextArea, Heading, Tag, Card, Tooltip } from "@aragon/ods";
import React, { useCallback, useState } from "react";
import { MainSection } from "@/components/layout/main-section";
import { useCreateProposal } from "../hooks/useCreateProposal";
import { useAccount } from "wagmi";
import { useCanCreateProposal } from "../hooks/useCanCreateProposal";
import { type Address, encodeFunctionData, isAddress, zeroAddress } from "viem";
import { ProposalActions } from "@/components/proposalActions/proposalActions";
import { useGetContracts } from "@/plugins/stake/hooks/useGetContract";
import { Token } from "@/plugins/voting/types/tokens";
import { usePinJSONtoIPFS } from "../hooks/usePinJSONtoIPFS";
import { GaugeDetailsDialog } from "@/plugins/voting/components/gauges-list/gauge-details-dialog";
import { type Control, type FieldErrors, Controller, useFieldArray, useForm } from "react-hook-form";
import { useAlerts } from "@/context/Alerts";
import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { isStringAddress } from "@/utils/address";
import * as v from "valibot";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { shortenAddress } from "@/utils/address";
import classNames from "classnames";
import { debounce } from "@/utils/debounce";
import ConditionalWrapper from "@/components/ConditionalWrapper";
import DeleteGaugeDialog from "../components/proposal/DeleteGaugeDialog";
import PlaceHolderOr from "../components/proposal/PlaceHolderOr";

export const STEPS = {
  METADATA: "METADATA",
  ACTIONS: "ACTIONS",
} as const;

const resourceSchema = v.pipe(
  v.object({
    field: v.pipe(v.string(), v.nonEmpty("You must provide a name"), v.maxLength(100, "Field is too long")),
    value: v.optional(v.pipe(v.string(), v.nonEmpty("Add your description"), v.maxLength(240, "Value is too long"))),
    url: v.optional(
      v.pipe(
        v.string(),
        v.nonEmpty("You must provide a URL for this resource"),
        v.url("The URL is badly formatted"),
        v.maxLength(2000, "URL is too long")
      )
    ),
  })
);

const gaugeSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty("You must provide a name"), v.maxLength(100, "Name is too long")),
  address: v.pipe(v.custom<string>(isStringAddress, "Invalid address"), v.nonEmpty("You must provide an address")),
  description: v.pipe(
    v.string(),
    v.nonEmpty("You must provide a description"),
    v.maxLength(500, "Description is too long")
  ),
  logo: v.pipe(
    v.string(),
    v.nonEmpty("You must provide a url"),
    v.url("The URL is badly formatted"),
    v.maxLength(2000, "URL is too long")
  ),
  resources: v.optional(v.array(resourceSchema)),
});

const formSchema = v.object({
  gauges: v.array(gaugeSchema),
});

export type Form = v.InferInput<typeof formSchema>;
export type Gauge = v.InferInput<typeof gaugeSchema>;
export type Resource = v.InferInput<typeof resourceSchema>;

export default function CreateMultipleGauges() {
  const { address: selfAddress, isConnected } = useAccount();
  const { canCreate } = useCanCreateProposal();
  const { actions, setTitle, setSummary, setDescription, setActions, isCreating, submitProposal } = useCreateProposal();
  const { mutateAsync: uploadMetadata, isPending: uploadingIpfs } = usePinJSONtoIPFS();

  const [previewGaugeIdx, setPreviewGaugeIdx] = useState<number | null>(null);
  const [wizardStep, setWizardStep] = useState<keyof typeof STEPS>(STEPS.METADATA);
  const [deleteGaugeIndex, setDeleteGaugeIndex] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors, dirtyFields },
  } = useForm<Form>({
    resolver: valibotResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      gauges: [
        {
          name: "",
          address: "",
          description: "",
          logo: "",
        },
      ],
    },
  });

  const watchForm = watch();
  const hasErrors = Object.keys(errors).length > 0;

  const singleGaugeHasErrors = useCallback(
    (gaugeIndex: number) => {
      return Object.keys(errors.gauges?.[gaugeIndex] ?? {}).length > 0;
    },
    [errors.gauges]
  );

  const canShowPreview = useCallback(
    (gaugeIndex: number) => {
      return (
        !singleGaugeHasErrors(gaugeIndex) &&
        !!dirtyFields.gauges?.[gaugeIndex]?.name &&
        !!dirtyFields.gauges?.[gaugeIndex]?.address &&
        !!dirtyFields.gauges?.[gaugeIndex]?.description &&
        !!dirtyFields.gauges?.[gaugeIndex]?.logo
      );
    },
    [dirtyFields.gauges, singleGaugeHasErrors]
  );

  const { fields: gaugeFields, append: appendGauge, remove: removeGauge } = useFieldArray({ control, name: "gauges" });

  const debouncedRemoveGauge = debounce(removeGauge, 700);

  const submitGauge = async () => {
    try {
      await submitProposal();
    } catch (error) {
      console.error(error);
      addAlert("Error while submitting the proposal", {
        description: "An error occurred while submitting the proposal. Check the console for more details.",
        type: "error",
      });
    }
  };

  const onSubmit = async (data: Form) => {
    if (actions.length === 0) {
      setTitle("Create Gauges Proposal");
      setSummary("Create multiple gauges");
      try {
        for (const gauge of data.gauges) {
          await createGauge(gauge);
        }
        setWizardStep(STEPS.ACTIONS);
      } catch (error) {
        console.error(error);
        addAlert("Error while creating the gauges", {
          description: "An error occurred while creating the gauges. Please try again.",
          type: "error",
        });
        return;
      }
    } else {
      await submitGauge();
    }
  };

  const { data: modeContracts } = useGetContracts(Token.MODE);
  const { data: bptContracts } = useGetContracts(Token.BPT);

  const modeVoterContract = modeContracts?.voterContract.result;
  const bptVoterContract = bptContracts?.voterContract.result;

  const createGauge = async (data: Gauge) => {
    const gaugeAddress = data.address as Address;
    if (!modeVoterContract || !isAddress(modeVoterContract)) return;
    if (!bptVoterContract || !isAddress(bptVoterContract)) return;

    await uploadMetadata(data, {
      onSuccess: (ipfsPin) => {
        const encodedData = encodeFunctionData({
          abi: SimpleGaugeVotingAbi,
          functionName: "createGauge",
          args: [gaugeAddress, ipfsPin],
        });
        setActions((prev) =>
          prev.concat(
            {
              to: modeVoterContract,
              value: 0n,
              data: encodedData,
            },
            {
              to: bptVoterContract,
              value: 0n,
              data: encodedData,
            }
          )
        );
        setDescription(
          (prev) => `${prev}Gauge: ${data.name}<br /> Address: ${data.address}<br/> Metadata: ${ipfsPin}\n\n`
        );
      },
      onError: (error) => {
        console.error(error);
        addAlert("Error while uploading metadata", {
          description: "An error occurred while uploading the metadata. Please try again.",
          type: "error",
        });
      },
    });
  };

  const openPreview = (gaugeIdx: number) => setPreviewGaugeIdx(gaugeIdx);
  const closePreview = () => setPreviewGaugeIdx(null);
  const { addAlert } = useAlerts();

  const goBack = () => {
    setActions([]);
    setWizardStep(STEPS.METADATA);
  };

  const handleDeleteGauge = (gaugeIndex: number) => {
    setDeleteGaugeIndex(gaugeIndex);
  };
  const closeDeleteDialog = () => {
    setDeleteGaugeIndex(null);
  };
  const handleConfirmDeleteGauge = () => {
    if (deleteGaugeIndex !== null) {
      debouncedRemoveGauge(deleteGaugeIndex);
    }
    closeDeleteDialog();
  };

  return (
    <MainSection narrow={true}>
      <div className="flex flex-col space-y-10">
        <div className="flex flex-col gap-y-3">
          <Heading size="h2">Create Gauges</Heading>
          <p className="text-lg text-neutral-500">
            Define all gauge metadata and upload them to IPFS before you are publishing them onchain with a transaction.
          </p>
        </div>
        <PlaceHolderOr selfAddress={selfAddress} canCreate={canCreate} isConnected={isConnected}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-2">
            {wizardStep === STEPS.METADATA && (
              <>
                {gaugeFields.map((gauge, gaugeIndex) => (
                  <div key={gauge.id} className="w-full rounded-xl bg-neutral-0 p-8">
                    <div className="mb-5 flex flex-col">
                      <h2 className="font-medium text-lg text-neutral-800">
                        {watchForm.gauges[gaugeIndex].name || `Gauge Name #${gaugeIndex + 1}`}
                      </h2>
                      {watchForm.gauges[gaugeIndex].address && isAddress(watchForm.gauges[gaugeIndex].address) ? (
                        <p className="text-neutral-600">{shortenAddress(watchForm.gauges[gaugeIndex].address)}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-y-6">
                      <div className="flex flex-col gap-y-6">
                        {/* Gauge Fields */}
                        <Controller
                          control={control}
                          name={`gauges.${gaugeIndex}.name`}
                          render={({ field }) => (
                            <div className="flex flex-col gap-y-2">
                              <InputText
                                label="Name"
                                inputClassName="placeholder:text-neutral-600"
                                placeholder="Gauge name"
                                maxLength={100}
                                wrapperClassName={classNames(
                                  errors.gauges?.[gaugeIndex]?.name?.message && "!border-critical-500"
                                )}
                                {...field}
                              />
                              {errors.gauges?.[gaugeIndex]?.name && (
                                <p className="text-sm text-critical-500">{errors.gauges[gaugeIndex].name.message}</p>
                              )}
                            </div>
                          )}
                        />
                        <Controller
                          control={control}
                          name={`gauges.${gaugeIndex}.address`}
                          render={({ field }) => (
                            <div className="flex flex-col gap-y-2">
                              <InputText
                                label="Address"
                                inputClassName="placeholder:text-neutral-600"
                                placeholder="0x12...3456"
                                wrapperClassName={classNames(
                                  errors.gauges?.[gaugeIndex]?.address?.message && "!border-critical-500"
                                )}
                                {...field}
                              />
                              {errors.gauges?.[gaugeIndex]?.address && (
                                <p className="text-sm text-critical-500">{errors.gauges[gaugeIndex].address.message}</p>
                              )}
                            </div>
                          )}
                        />
                        <Controller
                          control={control}
                          name={`gauges.${gaugeIndex}.description`}
                          render={({ field }) => (
                            <div className="flex flex-col gap-y-2">
                              <TextArea
                                label="Description"
                                inputClassName="placeholder:text-neutral-600"
                                maxLength={500}
                                wrapperClassName={classNames(
                                  errors.gauges?.[gaugeIndex]?.description?.message && "!border-critical-500"
                                )}
                                placeholder="Gauge description"
                                {...field}
                              />
                              {errors.gauges?.[gaugeIndex]?.description && (
                                <p className="text-sm text-critical-500">
                                  {errors.gauges[gaugeIndex].description.message}
                                </p>
                              )}
                            </div>
                          )}
                        />
                        <Controller
                          control={control}
                          name={`gauges.${gaugeIndex}.logo`}
                          render={({ field }) => (
                            <div className="flex flex-col gap-y-2">
                              <InputText
                                label="Logo URL"
                                inputClassName="placeholder:text-neutral-600"
                                placeholder="https://example.com/logo.png"
                                helpText="Provide a URL, which you are sure that it's permanently online. Recommend Ratio is 1:1"
                                wrapperClassName={classNames(
                                  errors.gauges?.[gaugeIndex]?.logo?.message && "!border-critical-500"
                                )}
                                {...field}
                              />
                              {errors.gauges?.[gaugeIndex]?.logo && (
                                <p className="text-sm text-critical-500">{errors.gauges[gaugeIndex].logo.message}</p>
                              )}
                            </div>
                          )}
                        />

                        {/* Nested Resources */}
                        <div className="flex flex-col gap-y-4">
                          <div className="flex flex-col gap-0.5 md:gap-1">
                            <div className="flex flex-row items-center gap-3">
                              <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg">
                                Resources
                              </p>
                              <Tag variant="neutral" label="Optional" />
                            </div>
                            <p className="text-sm font-normal leading-normal text-neutral-500 md:text-base">
                              Provide further resources like additional metadata or external links, so people understand
                              the gauge better.
                            </p>
                          </div>
                          <NestedResourceArray control={control} gaugeIndex={gaugeIndex} errors={errors} />
                        </div>
                      </div>
                      {previewGaugeIdx !== null && gaugeIndex === previewGaugeIdx && (
                        <GaugeDetailsDialog
                          selectedGauge={{
                            token: Token.MODE,
                            address: (watchForm.gauges[gaugeIndex].address ?? zeroAddress) as Address,
                            info: {
                              active: true,
                              created: 0n,
                              metadataURI: "url",
                            },
                            metadata: {
                              name: watchForm.gauges[gaugeIndex].name,
                              description: watchForm.gauges[gaugeIndex].description,
                              logo: watchForm.gauges[gaugeIndex].logo,
                              resources:
                                watchForm.gauges[gaugeIndex].resources?.map((resource) => ({
                                  field: resource.field,
                                  value: resource.value,
                                  url: resource.url,
                                })) ?? [],
                            },
                          }}
                          openDialog={true}
                          onClose={closePreview}
                        />
                      )}
                      <DeleteGaugeDialog
                        open={deleteGaugeIndex !== null}
                        gaugeName={watchForm.gauges[gaugeIndex]?.name || `Gauge #${gaugeIndex + 1}`}
                        onConfirm={handleConfirmDeleteGauge}
                        onCancel={closeDeleteDialog}
                      />
                      <div className="flex gap-x-3 self-end">
                        {gaugeIndex > 0 && (
                          <Button
                            size="md"
                            variant="critical"
                            onClick={() => handleDeleteGauge(gaugeIndex)}
                            iconLeft={IconType.MINUS}
                          >
                            Delete Gauge
                          </Button>
                        )}
                        <ConditionalWrapper
                          condition={!canShowPreview(gaugeIndex)}
                          wrapper={(children) => (
                            <Tooltip content="Please fill all required fields to preview the gauge">{children}</Tooltip>
                          )}
                        >
                          <Button
                            size="md"
                            variant="secondary"
                            onClick={() => openPreview(gaugeIndex)}
                            disabled={!canShowPreview(gaugeIndex)}
                          >
                            Preview
                          </Button>
                        </ConditionalWrapper>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between">
                  <Button
                    variant="secondary"
                    size="md"
                    iconLeft={IconType.PLUS}
                    onClick={() =>
                      appendGauge({
                        name: "",
                        address: "",
                        description: "",
                        logo: "",
                      })
                    }
                  >
                    Add Gauge
                  </Button>
                </div>
              </>
            )}
            {/* Actions */}

            {!!actions.length && wizardStep === STEPS.ACTIONS && (
              <ProposalActions
                actions={actions}
                emptyListDescription="The proposal has no actions defined yet. Select a type of action to add to the proposal."
              />
            )}

            {/* Submit */}

            <div className="mt-6 flex w-full flex-col justify-between gap-3 md:flex-row">
              {wizardStep === STEPS.ACTIONS && (
                <Button size="lg" variant="tertiary" onClick={goBack}>
                  Back
                </Button>
              )}
              <Button
                type="submit"
                isLoading={isCreating || uploadingIpfs || isSubmitting}
                disabled={hasErrors || isSubmitting || uploadingIpfs}
                size="lg"
                variant={"primary"}
              >
                {actions.length ? "Publish Gauges" : "Upload metadata"}
              </Button>
            </div>
          </form>
        </PlaceHolderOr>
      </div>
    </MainSection>
  );
}

const NestedResourceArray = ({
  control,
  gaugeIndex,
  errors,
}: {
  control: Control<Form>;
  gaugeIndex: number;
  errors: FieldErrors<Form>;
}) => {
  const {
    fields: resourceFields,
    append: appendResource,
    remove: removeResource,
  } = useFieldArray({
    control,
    name: `gauges.${gaugeIndex}.resources`,
  });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex flex-col gap-y-3">
        {resourceFields.map((resource, resourceIndex) => (
          <Card key={resource.id} className="flex flex-col gap-y-3 rounded-lg border border-neutral-100 p-6">
            <div className="flex flex-col items-start gap-y-4">
              <Controller
                control={control}
                name={`gauges.${gaugeIndex}.resources.${resourceIndex}.field`}
                render={({ field }) => (
                  <div className="flex w-full flex-col gap-y-2">
                    <InputText className="w-full" label="Label" placeholder="Website, Docs, Github, etc." {...field} />
                    {errors.gauges?.[gaugeIndex]?.resources?.[resourceIndex]?.field && (
                      <p className="text-sm text-critical-500">
                        {errors.gauges[gaugeIndex].resources[resourceIndex].field.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name={`gauges.${gaugeIndex}.resources.${resourceIndex}.value`}
                render={({ field }) => (
                  <div className="flex w-full flex-col gap-y-2">
                    <TextArea
                      maxLength={240}
                      className="w-full"
                      label="Value"
                      placeholder="100, Mode Network Wiki, etc."
                      wrapperClassName={
                        errors.gauges?.[gaugeIndex]?.resources?.[resourceIndex]?.value && "!border-critical-500"
                      }
                      {...field}
                    />
                    {errors.gauges?.[gaugeIndex]?.resources?.[resourceIndex]?.value && (
                      <p className="text-sm text-critical-500">
                        {errors.gauges[gaugeIndex].resources[resourceIndex].value.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name={`gauges.${gaugeIndex}.resources.${resourceIndex}.url`}
                render={({ field }) => (
                  <div className="flex w-full flex-col gap-y-2">
                    <InputText
                      className="w-full"
                      label="URL"
                      placeholder="https://gov.mode.network/wiki/..."
                      wrapperClassName={
                        errors.gauges?.[gaugeIndex]?.resources?.[resourceIndex]?.url && "!border-critical-500"
                      }
                      {...field}
                    />
                    {errors.gauges?.[gaugeIndex]?.resources?.[resourceIndex]?.url && (
                      <p className="text-sm text-critical-500">
                        {errors.gauges[gaugeIndex].resources[resourceIndex].url.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Button
                size="sm"
                className="self-end"
                variant="tertiary"
                onClick={() => removeResource(resourceIndex)}
                iconLeft={IconType.MINUS}
              >
                Remove
              </Button>
            </div>
            {errors.gauges?.[gaugeIndex]?.resources?.[resourceIndex]?.root && (
              <p className="text-sm text-critical-500">
                {errors.gauges[gaugeIndex].resources[resourceIndex].root.message}
              </p>
            )}
          </Card>
        ))}
      </div>
      <div className="flex">
        <Button
          variant="tertiary"
          size="md"
          iconLeft={IconType.PLUS}
          onClick={() => appendResource({ field: "", url: "", value: "" })}
        >
          Resource
        </Button>
      </div>
    </div>
  );
};
