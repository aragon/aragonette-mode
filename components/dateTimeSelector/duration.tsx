import React, { useCallback, useEffect } from "react";
import { AlertInline, InputNumber } from "@aragon/ods";
import { Controller, useFormContext } from "react-hook-form";

import {
  type Offset,
  daysToMills,
  hoursToMills,
  minutesToMills,
  getDaysHoursMins,
  HOURS_IN_DAY,
  MINS_IN_DAY,
  MINS_IN_HOUR,
} from "@/utils/dates";

type Props = {
  name?: string;
  minDuration?: Offset;
  maxDurationDays?: number; // duration in days
  defaultValues?: Offset;
};

const durationDefaults = {
  days: 0,
  hours: 0,
  minutes: 0,
};

const Duration: React.FC<Props> = ({ defaultValues, name = "", minDuration, maxDurationDays }) => {
  const defaults = { ...durationDefaults, ...defaultValues };
  const minimums = { ...durationDefaults, ...minDuration };

  const { control, getValues, setValue, trigger } = useFormContext();

  useEffect(() => {
    setValue("durationDays", defaults.days);
    setValue("durationHours", defaults.hours);
    setValue("durationMinutes", defaults.minutes);
  }, [defaults.days, defaults.hours, defaults.minutes, setValue]);

  const daoMinDurationMills =
    daysToMills(minimums.days) + hoursToMills(minimums.hours) + minutesToMills(minimums.minutes);

  const isMaxDurationDays = Number(getValues("durationDays")) === maxDurationDays;

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const durationLTMinimum = useCallback(
    (durationOffset: Offset) => {
      const duration =
        daysToMills(durationOffset.days ?? 0) +
        hoursToMills(durationOffset.hours ?? 0) +
        minutesToMills(durationOffset.minutes ?? 0);

      return duration < daoMinDurationMills;
    },
    [daoMinDurationMills]
  );

  const resetToMinDuration = useCallback(() => {
    setValue("durationDays", minimums.days);
    setValue("durationHours", minimums.hours);
    setValue("durationMinutes", minimums.minutes);
  }, [minimums.days, minimums.hours, minimums.minutes, setValue]);

  const handleDaysChanged = useCallback(
    (value: string, onChange: (e: any) => void) => {
      const parsedValue = Number(value);
      const event = { target: { value: value } };

      const [formHours, formMins] = getValues(["durationHours", "durationMinutes"]);

      const formDuration = {
        days: parsedValue,
        hours: Number(formHours),
        minutes: Number(formMins),
      };

      if (maxDurationDays && parsedValue >= maxDurationDays) {
        event.target.value = maxDurationDays.toString();

        setValue("durationDays", maxDurationDays.toString());
        setValue("durationHours", "0");
        setValue("durationMinutes", "0");
      } else if (parsedValue <= minimums.days && durationLTMinimum(formDuration)) {
        resetToMinDuration();
        event.target.value = minimums.days.toString();
      }
      trigger(["durationMinutes", "durationHours", "durationDays"]);
      onChange(event);
    },
    [durationLTMinimum, getValues, maxDurationDays, minimums.days, resetToMinDuration, setValue, trigger]
  );

  const handleHoursChanged = useCallback(
    (value: string, onChange: (e: any) => void) => {
      const parsedValue = Number(value);
      const event = { target: { value: value } };

      const [formDays, formMins] = getValues(["durationDays", "durationMinutes"]);

      const formDuration = {
        days: Number(formDays),
        hours: parsedValue,
        minutes: Number(formMins),
      };

      if (parsedValue >= HOURS_IN_DAY) {
        const { days, hours } = getDaysHoursMins(parsedValue, "hours");
        event.target.value = hours.toString();

        if (days > 0) {
          setValue("durationDays", (Number(getValues("durationDays")) + days).toString());
        }
      } else if (parsedValue <= minimums.hours && durationLTMinimum(formDuration)) {
        resetToMinDuration();
        event.target.value = minimums.hours.toString();
      }
      trigger(["durationMinutes", "durationHours", "durationDays"]);
      onChange(event);
    },
    [durationLTMinimum, getValues, minimums.hours, resetToMinDuration, setValue, trigger]
  );

  const handleMinutesChanged = useCallback(
    (value: string, onChange: (e: any) => void) => {
      const parsedValue = Number(value);
      const event = { target: { value: value } };

      const [formDays, formHours] = getValues(["durationDays", "durationHours"]);

      const formDuration = {
        days: Number(formDays),
        hours: Number(formHours),
        minutes: parsedValue,
      };

      if (parsedValue >= MINS_IN_HOUR) {
        const [oldDays, oldHours] = getValues(["durationDays", "durationHours"]);

        const totalMins = oldDays * MINS_IN_DAY + oldHours * MINS_IN_HOUR + parsedValue;

        const { days, hours, mins } = getDaysHoursMins(totalMins);
        setValue("durationDays", days.toString());
        setValue("durationHours", hours.toString());
        event.target.value = mins.toString();
      } else if (parsedValue <= minimums.minutes && durationLTMinimum(formDuration)) {
        resetToMinDuration();
        event.target.value = minimums.minutes.toString();
      }
      trigger(["durationMinutes", "durationHours", "durationDays"]);
      onChange(event);
    },
    [durationLTMinimum, getValues, minimums.minutes, resetToMinDuration, setValue, trigger]
  );

  /*************************************************
   *                      Render                   *
   *************************************************/
  return (
    <div className="flex flex-col gap-y-3 rounded-xl bg-neutral-0 p-6 md:flex-row md:gap-x-3 md:gap-y-0">
      <Controller
        name={`${name}durationMinutes`}
        control={control}
        defaultValue={`${defaults.minutes}`}
        rules={{
          required: "Minutes can't be empty",
          validate: (value) => (value <= 59 && value >= 0 ? true : "Minutes should be between 0 and 59"),
        }}
        render={({ field: { onBlur, onChange, value, name }, fieldState: { error } }) => (
          <div className="w-full">
            <InputNumber
              label="Minutes"
              name={name}
              value={Number(value).toString()}
              onBlur={onBlur}
              onChange={(v) => handleMinutesChanged(v, onChange)}
              placeholder={"0"}
              min={0}
              disabled={isMaxDurationDays}
              {...(error?.message
                ? { alert: { variant: "critical", message: error.message }, variant: "critical" }
                : {})}
            />
          </div>
        )}
      />

      <Controller
        name={`${name}durationHours`}
        control={control}
        defaultValue={`${defaults.hours}`}
        rules={{ required: "Hours is required" }}
        render={({ field: { onBlur, onChange, value, name }, fieldState: { error } }) => (
          <div className="w-full">
            <InputNumber
              label="Hours"
              name={name}
              value={Number(value).toString()}
              onBlur={onBlur}
              onChange={(v) => handleHoursChanged(v, onChange)}
              placeholder={"0"}
              min={0}
              disabled={isMaxDurationDays}
              {...(error?.message
                ? { alert: { variant: "critical", message: error.message }, variant: "critical" }
                : {})}
            />
          </div>
        )}
      />

      <Controller
        name={`${name}durationDays`}
        control={control}
        defaultValue={`${defaults.days}`}
        rules={{
          required: "Days can't be empty",
          validate: (value) => (value >= 0 ? true : "Days can't be negative"),
        }}
        render={({ field: { onBlur, onChange, value, name }, fieldState: { error } }) => (
          <div className="w-full">
            <InputNumber
              label="Days"
              name={name}
              value={Number(value).toString()}
              onBlur={onBlur}
              onChange={(v) => handleDaysChanged(v, onChange)}
              placeholder={"0"}
              min={0}
              {...(error?.message
                ? { alert: { variant: "critical", message: error.message }, variant: "critical" }
                : {})}
            />
          </div>
        )}
      />
    </div>
  );
};

export default Duration;

export type DurationLabelProps = {
  maxDuration?: boolean;
  minDuration?: boolean;
  limitOnMax?: boolean;
  alerts?: {
    minDuration: string;
    maxDuration: string;
    acceptableDuration: string;
  };
};

export const DurationLabel: React.FC<DurationLabelProps> = ({ alerts, ...props }) => {
  if (props.minDuration && alerts?.minDuration) {
    return <AlertInline message={alerts.minDuration} variant="critical" />;
  } else if (props.maxDuration && alerts?.maxDuration) {
    return <AlertInline message={alerts.maxDuration} variant={props.limitOnMax ? "critical" : "warning"} />;
  } else {
    return alerts?.acceptableDuration ? <AlertInline message={alerts.acceptableDuration} variant="info" /> : null;
  }
};
