import { Heading, ToggleGroup, Toggle } from "@aragon/ods";
import { type Control, Controller } from "react-hook-form";
import { FormItem } from "./formItem";
import { type ProposalCreationFormData } from "./types";
import React from "react";

interface IProposalCategoryProps {
  isAutoFill: boolean;
  control: Control<ProposalCreationFormData>;
}

const proposalCategories = ["Core", "Contracts", "Interface", "Informational"];

export const ProposalCategory: React.FC<IProposalCategoryProps> = (props) => {
  const { control, isAutoFill } = props;

  const helpText = isAutoFill
    ? "Define the PIP category. This is automatically selected based on your Github proposal selection."
    : "Define the PIP category.";

  return (
    <>
      <Heading size="h2">Settings</Heading>
      <div className="flex flex-col gap-y-4">
        <FormItem id="type" label="Category" helpText={helpText}>
          <Controller
            name="type"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <ToggleGroup isMultiSelect={false} {...rest} onChange={(value) => (isAutoFill ? null : onChange(value))}>
                {proposalCategories.map((type) => (
                  <Toggle value={type} label={type} key={type} />
                ))}
              </ToggleGroup>
            )}
          />
        </FormItem>
      </div>
    </>
  );
};
