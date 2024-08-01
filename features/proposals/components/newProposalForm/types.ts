import { URL_PATTERN } from "@/utils/input-values";
import dayjs from "dayjs";
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

type FormMetadata = {
  mipSelected: boolean;
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
  mipSelected: false,
  actionType: ActionType.Signaling,
  bytecode: "",
  startSwitch: "now" as const,
  durationSwitch: "default" as const,
};
// =================================================
// form title, body, start time, end time
// defined by Snapshot
export const MAX_BODY_CHAR_COUNT = 10000;

// Because output is HTML, 7 chars are taken up by default
// for paragraph tags
export const CHAR_OFFSET = 7;

export const startSwitchValues = [
  { label: "Immediately", value: "now" },
  { label: "Specific date + time", value: "date" },
];

export const endSwitchValues = [
  { label: "1 week", value: "duration" },
  { label: "Specific date + time", value: "date" },
];

export const ProposalCreationSchema = z
  .object({
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
    startSwitch: z.enum(startSwitchValues.map((v) => v.value) as unknown as readonly [string, ...string[]]),
    endSwitch: z.enum(endSwitchValues.map((v) => v.value) as unknown as readonly [string, ...string[]]),

    start: z.object({
      date: z.string().optional(),
      time: z.string().optional(),
    }),

    end: z.object({
      date: z.string().optional(),
      time: z.string().optional(),
    }),
  })
  // refine for required start date
  .refine(
    (data) => {
      if (data.startSwitch === "date") {
        return data.start.date !== "";
      }

      return true;
    },
    { message: "Start date is required", path: ["start.date"] }
  )

  // refine for start date being now or in future
  .refine(
    (data) => {
      if (data.startSwitch === "date" && data.start.date) {
        const startDate = dayjs(data.start.date).startOf("day");
        const currentDate = dayjs().startOf("day");
        return startDate.isSame(currentDate) || startDate.isAfter(currentDate);
      }
      return true;
    },
    {
      message: "Start date must be in the future",
      path: ["start.date"],
    }
  )

  // refine for required start time
  .refine(
    (data) => {
      // Ensure that startTime is provided if startSwitch is 'date'
      if (data.startSwitch === "date") {
        return data.start.time !== "";
      }
      return true;
    },
    {
      message: "Start time is required",
      path: ["start.time"],
    }
  )

  // refine for start date & time being in the future
  .refine(
    (data) => {
      if (data.startSwitch === "date" && data.start.date && data.start.time) {
        // If time is provided, combine it with the date
        const combinedDateTime = dayjs(`${data.start.date}T${data.start.time}`); // Combine date and time
        const currentDateTime = dayjs();

        return combinedDateTime.isSame(currentDateTime) || combinedDateTime.isAfter(currentDateTime);
      }

      return true;
    },
    {
      message: "Proposal cannot start in the past",
      path: ["start.time"],
    }
  )

  // refine for required end date
  .refine(
    (data) => {
      if (data.endSwitch === "date") {
        return data.end.date !== "";
      }

      return true;
    },
    { message: "End date is required", path: ["end.date"] }
  )

  // refine for end date now or in the future
  .refine(
    (data) => {
      if (data.endSwitch === "date" && data.end.date) {
        const endDate = dayjs(data.end.date).startOf("day");
        const currentDate = dayjs().startOf("day");
        return endDate.isSame(currentDate) || endDate.isAfter(currentDate);
      }
      return true;
    },
    {
      message: "End date must be in the future",
      path: ["end.date"],
    }
  )

  // refine for require end time
  .refine(
    (data) => {
      if (data.endSwitch === "date") {
        return data.end.time !== "";
      }
      return true;
    },
    {
      message: "End time is required",
      path: ["end.time"],
    }
  )

  // refine for end date & time being in the future
  .refine(
    (data) => {
      if (data.endSwitch === "date" && data.end?.date && data.end?.time) {
        // If time is provided, combine it with the date
        const combinedDateTime = dayjs(`${data.end.date}T${data.end.time}`); // Combine date and time
        const currentDateTime = dayjs();

        return combinedDateTime.isSame(currentDateTime) || combinedDateTime.isAfter(currentDateTime);
      }

      return true;
    },
    {
      message: "Proposal cannot end in the past",
      path: ["end.time"],
    }
  );
