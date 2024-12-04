import React, { type ReactNode, useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button, IconType, InputText, TextArea } from "@aragon/ods";
import { Else, ElseIf, If, Then } from "@/components/if";
import { MainSection } from "@/components/layout/main-section";
import { useCreateProposal } from "../hooks/useCreateProposal";
import { useAccount } from "wagmi";
import { useCanCreateProposal } from "../hooks/useCanCreateProposal";
import { MissingContentView } from "@/components/MissingContentView";
import { useWeb3Modal } from "@web3modal/wagmi/react";
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
import { useRouter } from "next/router";

type Props = {
  id: Address;
};

export const EditGauge: React.FC<Props> = ({ id }: { id: Address }) => {
  const router = useRouter();
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
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<{
    title: string;
    gaugeDescription: string;
    gaugeLogo: string;
    resources: { field: string; value: string; url: string }[];
  }>({
    defaultValues: {
      title: "",
      gaugeDescription: "",
      gaugeLogo: "",
      resources: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "resources",
  });

  const watchFields = watch();

  useEffect(() => {
    setTitle(watchFields.title);
  }, [watchFields.title, setTitle]);

  useEffect(() => {
    setSummary(watchFields.gaugeDescription?.substring(0, 60).concat("..."));
    setDescription(watchFields.gaugeDescription);
  }, [watchFields.gaugeLogo, setDescription, watchFields.gaugeDescription, setSummary]);

  const { mutate: uploadMetadata, isPending: uploadingIpfs } = usePinJSONtoIPFS({
    name: watchFields.title,
    description: watchFields.gaugeDescription,
    logo: watchFields.gaugeLogo,
    resources: watchFields.resources,
  });

  const metadataInfo = metadata?.[0]?.data?.metadata;

  useEffect(() => {
    if (didInitialize && !metadataInfo) return;
    reset({
      title: metadataInfo?.name,
      gaugeDescription: metadataInfo?.description,
      gaugeLogo: metadataInfo?.logo,
      resources: metadataInfo?.resources,
    });
    setDidInitialize(true);
  }, [didInitialize, metadataInfo, reset]);

  const createGauge = async () => {
    if (!gaugeAddress) return;
    if (!isAddress(gaugeAddress)) return;
    if (!modeVoterContract || !isAddress(modeVoterContract)) return;
    if (!bptVoterContract || !isAddress(bptVoterContract)) return;

    uploadMetadata(undefined, {
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

  const onSubmit = async () => {
    if (actions.length === 0) {
      await createGauge();
    } else {
      await submitGauge();
    }
  };

  return (
    <MainSection narrow={true}>
      <div className="flex w-full flex-row content-center justify-between">
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => {
            router.back();
          }}
        >
          Back
        </Button>
      </div>
      <div className="w-full justify-between">
        <h1 className="mb-8 line-clamp-1 flex flex-1 shrink-0 text-2xl font-normal leading-tight text-neutral-800 md:text-3xl">
          Edit Gauge Proposal
        </h1>

        <PlaceHolderOr selfAddress={selfAddress} canCreate={canCreate} isConnected={isConnected}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <InputText
                    label="Name"
                    inputClassName="placeholder:text-neutral-600"
                    maxLength={100}
                    placeholder="Gauge name"
                    variant="default"
                    {...field}
                  />
                )}
              />
            </div>

            <div className="mb-6">
              <Controller
                control={control}
                name="gaugeDescription"
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
                name="gaugeLogo"
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

            <div className="mb-6 flex flex-col gap-y-2 md:gap-y-3">
              <div className="flex flex-col gap-0.5 md:gap-1">
                <div className="flex gap-x-3">
                  <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg">Resources</p>
                </div>
                <p className="text-sm font-normal leading-normal text-neutral-500 md:text-base">
                  Add links to external resources
                </p>
              </div>
              <div className="flex flex-col gap-y-4 rounded-xl border border-neutral-100 bg-neutral-0 p-4">
                <If lengthOf={watchFields.resources} is={0}>
                  <p className="text-sm font-normal leading-normal text-neutral-500 md:text-base">
                    There are no resources yet. Click the button below to add the first one.
                  </p>
                </If>
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex flex-col gap-y-3 py-3 md:py-4">
                    <div className="flex items-center gap-x-3">
                      <Controller
                        control={control}
                        name={`resources.${idx}.field` as const}
                        render={({ field }) => (
                          <InputText
                            readOnly={isCreating}
                            placeholder="Title"
                            inputClassName="placeholder:text-neutral-600"
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`resources.${idx}.url` as const}
                        render={({ field }) => (
                          <InputText
                            readOnly={isCreating}
                            placeholder="URL"
                            inputClassName="placeholder:text-neutral-600"
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`resources.${idx}.value` as const}
                        render={({ field }) => (
                          <InputText
                            readOnly={isCreating}
                            placeholder="Value"
                            inputClassName="placeholder:text-neutral-600"
                            {...field}
                          />
                        )}
                      />
                      <Button size="sm" variant="tertiary" onClick={() => remove(idx)} iconLeft={IconType.MINUS} />
                    </div>
                  </div>
                ))}
              </div>
              <span className="mt-3">
                <Button
                  variant="tertiary"
                  size="sm"
                  iconLeft={IconType.PLUS}
                  disabled={isCreating}
                  onClick={() => {
                    append({ field: "", value: "", url: "" });
                  }}
                >
                  Add resource
                </Button>
              </span>
            </div>

            {!!actions.length && (
              <ProposalActions
                actions={actions}
                emptyListDescription="The proposal has no actions defined yet. Select a type of action to add to the proposal."
              />
            )}

            {/* Submit */}

            <div className="mt-6 flex w-full flex-col gap-3 md:flex-row">
              <Button
                onClick={() => {
                  setOpenPreview(true);
                }}
              >
                Preview
              </Button>
              <Button
                type="submit"
                isLoading={isCreating || uploadingIpfs || isSubmitting}
                className="border-primary-400"
                size="lg"
                variant={actions.length ? "primary" : "secondary"}
              >
                <If lengthOf={actions} above={0}>
                  <Then>Submit proposal</Then>
                  <Else>Upload metadata</Else>
                </If>
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
                  name: watchFields.title,
                  description: watchFields.gaugeDescription,
                  logo: watchFields.gaugeLogo,
                  resources: watchFields.resources,
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

const PlaceHolderOr = ({
  selfAddress,
  isConnected,
  canCreate,
  children,
}: {
  selfAddress: Address | undefined;
  isConnected: boolean;
  canCreate: boolean | undefined;
  children: ReactNode;
}) => {
  const { open } = useWeb3Modal();
  return (
    <If true={!selfAddress || !isConnected}>
      <Then>
        {/* Not connected */}
        <MissingContentView callToAction="Connect wallet" onClick={() => open()}>
          Please connect your wallet to continue.
        </MissingContentView>
      </Then>
      <ElseIf true={!canCreate}>
        {/* Not a member */}
        <MissingContentView>
          You cannot create proposals on the multisig because you are not currently defined as a member.
        </MissingContentView>
      </ElseIf>
      <Else>{children}</Else>
    </If>
  );
};

export default EditGauge;
