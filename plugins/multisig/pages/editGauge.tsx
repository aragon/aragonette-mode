import React, { useEffect, useMemo, useState } from "react";
import { type Control, Controller, type FieldErrors, useFieldArray, useForm } from "react-hook-form";
import { Button, Card, IconType, InputText, Tag, TextArea, Tooltip } from "@aragon/ods";
import { MainSection } from "@/components/layout/main-section";
import { useCreateProposal } from "../hooks/useCreateProposal";
import { useAccount } from "wagmi";
import { useCanCreateProposal } from "../hooks/useCanCreateProposal";
import { type Address, encodeFunctionData, isAddress, zeroAddress } from "viem";
import { ProposalActions } from "@/components/proposalActions/proposalActions";
import { useGetContracts } from "@/plugins/stake/hooks/useGetContract";
import { Token } from "@/plugins/stake/types/tokens";
import { usePinJSONtoIPFS } from "../hooks/usePinJSONtoIPFS";
import { GaugeDetailsDialog } from "@/plugins/voting/components/gauges-list/gauge-details-dialog";
import { useGetGaugeMetadata } from "@/plugins/voting/hooks/useGetGaugeMetadata";
import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { useGetGaugeInfo } from "@/plugins/voting/hooks/useGetGaugeInfo";
import { useAlerts } from "@/context/Alerts";
import { type GaugeMetadata } from "@/plugins/voting/components/gauges-list/types";
import * as v from "valibot";
import { isStringAddress } from "@/utils/address";
import { valibotResolver } from "@hookform/resolvers/valibot";
import classNames from "classnames";
import PlaceHolderOr from "../components/proposal/PlaceHolderOr";
import ConditionalWrapper from "@/components/ConditionalWrapper";

type Props = {
  id: Address;
};

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
  }),
  v.forward(
    v.partialCheck(
      [["value"], ["url"]],
      (value) => value.url?.trim() !== "" || value.value?.trim() !== "",
      "You must provide a value or a URL"
    ),
    ["value"]
  )
);

const formSchema = v.object({
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

export type Form = v.InferInput<typeof formSchema>;
export type Resource = v.InferInput<typeof resourceSchema>;

export const EditGauge: React.FC<Props> = ({ id }: { id: Address }) => {
  const { address: selfAddress, isConnected } = useAccount();
  const { data: modeInfo } = useGetGaugeInfo(Token.MODE, id);
  const { data: bptInfo } = useGetGaugeInfo(Token.BPT, id);
  const { canCreate } = useCanCreateProposal();
  const { actions, setTitle, setSummary, setDescription, setActions, isCreating, submitProposal } = useCreateProposal();
  const [didInitialize, setDidInitialize] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [gaugeAddress] = useState<string | undefined>(id);
  const { addAlert } = useAlerts();

  const { data: modeContracts } = useGetContracts(Token.MODE);
  const { data: bptContracts } = useGetContracts(Token.BPT);

  const modeVoterContract = modeContracts?.voterContract.result;
  const bptVoterContract = bptContracts?.voterContract.result;

  const ipfsUris = useMemo(
    () => [modeInfo?.info.metadataURI, bptInfo?.info.metadataURI].filter((uri): uri is string => !!uri),
    [modeInfo, bptInfo]
  );

  const { metadata } = useGetGaugeMetadata<GaugeMetadata>(ipfsUris);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<Form>({
    resolver: valibotResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      address: "",
      description: "",
      logo: "",
    },
  });

  const watchForm = watch();
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    setTitle(watchForm.name);
  }, [watchForm.name, setTitle]);

  useEffect(() => {
    setSummary(watchForm.description?.substring(0, 60).concat("..."));
    setDescription(watchForm.description);
  }, [watchForm.logo, setDescription, watchForm.description, setSummary]);

  const { mutate: uploadMetadata, isPending: uploadingIpfs } = usePinJSONtoIPFS();

  const metadataInfo = metadata?.[0]?.data?.metadata;

  useEffect(() => {
    if (didInitialize && !metadataInfo) return;
    reset({
      name: metadataInfo?.name,
      description: metadataInfo?.description,
      logo: metadataInfo?.logo,
      resources: metadataInfo?.resources,
    });
    setDidInitialize(true);
  }, [didInitialize, metadataInfo, reset]);

  const createGauge = async (data: Form) => {
    if (!gaugeAddress) return;
    if (!isAddress(gaugeAddress)) return;
    if (!modeVoterContract || !isAddress(modeVoterContract)) return;
    if (!bptVoterContract || !isAddress(bptVoterContract)) return;

    uploadMetadata(data, {
      onSuccess: async (ipfsPin) => {
        const data = encodeFunctionData({
          abi: SimpleGaugeVotingAbi,
          functionName: "updateGaugeMetadata",
          args: [gaugeAddress, ipfsPin],
        });

        setActions([
          {
            to: modeVoterContract,
            data,
            value: 0n,
          },
          {
            to: bptVoterContract,
            data,
            value: 0n,
          },
        ]);
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
      await createGauge(data);
    } else {
      await submitGauge();
    }
  };

  return (
    <MainSection narrow={true}>
      <div className="w-full justify-between">
        <h1 className="mb-8 line-clamp-1 flex flex-1 shrink-0 text-2xl font-normal leading-tight text-neutral-800 md:text-3xl">
          Edit Gauge Proposal
        </h1>

        <PlaceHolderOr selfAddress={selfAddress} canCreate={canCreate} isConnected={isConnected}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <InputText
                      label="Name"
                      inputClassName="placeholder:text-neutral-600"
                      placeholder="Gauge name"
                      maxLength={100}
                      wrapperClassName={classNames(errors?.name?.message && "!border-critical-500")}
                      {...field}
                    />
                    {errors?.name && <p className="text-sm text-critical-500">{errors?.name?.message}</p>}
                  </div>
                )}
              />
            </div>

            <div className="mb-6">
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextArea
                    label="Description"
                    inputClassName="placeholder:text-neutral-600"
                    maxLength={500}
                    placeholder="Gauge description"
                    variant="default"
                    {...field}
                  />
                )}
              />
            </div>

            <div className="mb-6">
              <Controller
                control={control}
                name="logo"
                render={({ field }) => (
                  <InputText
                    label="Logo URL"
                    inputClassName="placeholder:text-neutral-600"
                    placeholder="https://example.com/logo.png"
                    variant="default"
                    {...field}
                  />
                )}
              />
            </div>

            {/* Nested Resources */}
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-0.5 md:gap-1">
                <div className="flex flex-row items-center gap-3">
                  <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg">Resources</p>
                  <Tag variant="neutral" label="Optional" />
                </div>
                <p className="text-sm font-normal leading-normal text-neutral-500 md:text-base">
                  Provide further resources like additional metadata or external links, so people understand the gauge
                  better.
                </p>
              </div>
              <NestedResourceArray control={control} errors={errors} />
            </div>

            {!!actions.length && (
              <ProposalActions
                actions={actions}
                emptyListDescription="The proposal has no actions defined yet. Select a type of action to add to the proposal."
              />
            )}

            {/* Submit */}

            <div className="mt-6 flex w-full flex-col gap-3 md:flex-row">
              <ConditionalWrapper
                condition={!hasErrors}
                wrapper={(children) => (
                  <Tooltip content="Please fill all required fields to preview the gauge">{children}</Tooltip>
                )}
              >
                <Button size="md" variant="secondary" onClick={() => setOpenPreview(true)} disabled={!hasErrors}>
                  Preview
                </Button>
              </ConditionalWrapper>
              <Button
                type="submit"
                isLoading={isCreating || uploadingIpfs || isSubmitting}
                disabled={hasErrors}
                size="lg"
                variant={"primary"}
              >
                {actions.length ? "Publish Gauges" : "Upload metadata"}
              </Button>
            </div>
            <GaugeDetailsDialog
              selectedGauge={{
                token: Token.MODE,
                address: (gaugeAddress ?? zeroAddress) as Address,
                info: {
                  active: true,
                  created: 0n,
                  metadataURI: "url",
                },
                metadata: {
                  name: watchForm.name,
                  description: watchForm.description,
                  logo: watchForm.logo,
                  resources: watchForm.resources,
                },
              }}
              openDialog={openPreview}
              onClose={() => {
                setOpenPreview(false);
              }}
            />
          </form>
        </PlaceHolderOr>
      </div>
    </MainSection>
  );
};

const NestedResourceArray = ({ control, errors }: { control: Control<Form>; errors: FieldErrors<Form> }) => {
  const {
    fields: resourceFields,
    append: appendResource,
    remove: removeResource,
  } = useFieldArray({
    control,
    name: "resources",
  });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex flex-col gap-y-3">
        {resourceFields.map((resource, resourceIndex) => (
          <Card key={resource.id} className="flex flex-col gap-y-3 rounded-lg border border-neutral-100 p-6">
            <div className="flex flex-col items-start gap-y-4">
              <Controller
                control={control}
                name={`resources.${resourceIndex}.field`}
                render={({ field }) => (
                  <div className="flex w-full flex-col gap-y-2">
                    <InputText className="w-full" label="Label" placeholder="e.g., Website, Docs" {...field} />
                    {errors.resources?.[resourceIndex]?.field && (
                      <p className="text-sm text-critical-500">{errors.resources[resourceIndex].field.message}</p>
                    )}
                  </div>
                )}
              />
              <Controller
                control={control}
                name={`resources.${resourceIndex}.value`}
                render={({ field }) => (
                  <div className="flex w-full flex-col gap-y-2">
                    <TextArea
                      maxLength={240}
                      className="w-full"
                      label="Value"
                      placeholder="e.g., Documentation"
                      wrapperClassName={errors.resources?.[resourceIndex]?.value && "!border-critical-500"}
                      {...field}
                    />
                    {errors.resources?.[resourceIndex]?.value && (
                      <p className="text-sm text-critical-500">{errors.resources[resourceIndex].value.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name={`resources.${resourceIndex}.url`}
                render={({ field }) => (
                  <div className="flex w-full flex-col gap-y-2">
                    <InputText
                      className="w-full"
                      label="URL"
                      placeholder="https://example.com"
                      wrapperClassName={errors.resources?.[resourceIndex]?.url && "!border-critical-500"}
                      {...field}
                    />
                    {errors.resources?.[resourceIndex]?.url && (
                      <p className="text-sm text-critical-500">{errors.resources[resourceIndex].url.message}</p>
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
            {errors.resources?.[resourceIndex]?.root && (
              <p className="text-sm text-critical-500">{errors.resources[resourceIndex].root.message}</p>
            )}
          </Card>
        ))}
      </div>
      <div className="flex gap-x-3">
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

export default EditGauge;
