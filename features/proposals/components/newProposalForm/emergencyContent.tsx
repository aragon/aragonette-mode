import { InputText, TextArea } from "@aragon/ods";
import React from "react";
import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import { type ProposalCreationFormData } from "./types";

interface IEmergencyContentProps {
  control: Control<ProposalCreationFormData>;
}

export const EmergencyContent: React.FC<IEmergencyContentProps> = ({ control }) => {
  return (
    <>
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState: { error } }) => (
          <InputText
            label="Title"
            helpText="Define your emergency proposal title"
            placeholder="Testnet hotfix..."
            {...field}
            {...(error?.message ? { alert: { variant: "critical", message: error.message }, variant: "critical" } : {})}
          />
        )}
      />
      <Controller
        control={control}
        name="summary"
        render={({ field, fieldState: { error } }) => (
          <TextArea
            label="Summary"
            helpText="Describe your proposal in 2-3 sentences. This will appear in the proposal overview"
            placeholder="Adding secondary validator..."
            {...field}
            {...(error?.message ? { alert: { variant: "critical", message: error.message }, variant: "critical" } : {})}
          />
        )}
      />
    </>
  );
};
