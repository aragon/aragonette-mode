import { URL_PATTERN } from "@/utils/input-values";
import { z } from "zod";

const UrlRegex = new RegExp(URL_PATTERN);

const ResourceSchema = z.object({
  name: z.string().optional(),
  link: z
    .string()
    .optional()
    .refine((val) => !val || UrlRegex.test(val) || z.string().email().safeParse(val).success, {
      message: "Invalid resource link",
    }),
});

const ResourcesSchema = z.object({
  forum: ResourceSchema.optional(),
  github: ResourceSchema.optional(),
  transparencyReport: ResourceSchema.optional(),
});

export const ProposalCreationSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  summary: z.string().min(1, { message: "Summary is required" }),
  description: z.string().optional(),
  transparencyReport: z.string().optional(),
  resources: ResourcesSchema,
  type: z.string(),
  emergency: z.boolean(),
});

export interface ICreateProposalMetadata {
  title: string;
  summary: string;
  type: string;
  description?: string;
  resources: Array<{
    name: string;
    url: string;
  }>;
}

export interface ICreateProposalMetadataFormData {
  title: string;
  summary: string;
  type: string;
  description?: string;
  resources: z.infer<typeof ResourcesSchema>;
}

export enum ActionType {
  Signaling = "Signaling",
  Upload = "Bytecode upload",
}

export const startSwitchValues = [
  { label: "Immediately", value: "now" },
  { label: "Specific date + time", value: "date" },
];

export const durationSwitchValues = [
  { label: "4 weeks", value: "default" },
  { label: "Specific duration", value: "duration" },
];

type FormMetadata = {
  pipSelected: boolean;
  actionType: ActionType;
  bytecode: string;

  // proposal times
  startDate: string;
  startTime: string;
  duration: number;
  startUtc: string;
  startSwitch: "date" | "now";
  durationSwitch: "default" | "duration";
  durationMills: string;
  durationDays: string;
  durationHours: string;
  durationMinutes: string;
  endTimeWarning: boolean;
  startTimeWarning: boolean;
};

export type ProposalCreationFormData = z.infer<typeof ProposalCreationSchema> & FormMetadata;

export const ProposalCreationFormDefaultValues = {
  title: "",
  summary: "",
  description: "",
  type: "",
  resources: {
    forum: { url: "", name: "" },
    github: { url: "", name: "" },
  },
  emergency: false,

  // form metadata
  pipSelected: false,
  actionType: ActionType.Signaling,
  bytecode: "",
  startSwitch: "now" as const,
  durationSwitch: "default" as const,
};
