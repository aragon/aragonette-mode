import React, { useCallback, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import {
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getFormattedUtcOffset,
  type Offset,
} from "@/utils/dates";
import { InputDate, InputTime } from "@aragon/ods";
import dayjs from "dayjs";
import { timezones } from "./utcData";

export const CORRECTION_DELAY = 2000;

type Props = {
  mode?: "start" | "end";
  onUtcClicked: () => void;
  defaultDateOffset?: Offset;
  minDurationAlert: string;
  minDurationMills: number;
  maxDurationMills?: number;
};

const defaultOffsets = {
  days: 0,
  hours: 0,
  minutes: 0,
};

let validationTimeout: NodeJS.Timeout | undefined;

const DateTimeSelector: React.FC<Props> = ({
  mode,
  // onUtcClicked,
  defaultDateOffset,
  minDurationAlert,
  minDurationMills,
  maxDurationMills = 0,
}) => {
  const { days, hours, minutes } = { ...defaultOffsets, ...defaultDateOffset };

  const { control, getValues, clearErrors, setValue } = useFormContext();

  // const [value] = useWatch({ control, name: [`${mode}Utc`] });

  const currTimezone = useMemo(() => timezones.find((tz) => tz === getFormattedUtcOffset()) ?? timezones[13], []);

  // Validates all fields (date, time and UTC) for both start and end
  // simultaneously. This is necessary, as all the fields are related to one
  // another. The validation gathers information from all start and end fields
  // and constructs two date (start and end). The validation leads to a warning
  // if the dates violate any of the following constraints:
  //   - The start date is in the past
  //   - The end date is before what should be the minimum duration based on
  //     the start date.
  // When these constraints are violated, the respective fields are automatically
  // corrected. This does *not* return any errors.
  // If the form is invalid, errors are set for the respective group of fields.
  const validator = useCallback(() => {
    // build start date/time in utc mills
    // check end time using start and duration
    let startDateTime: Date;

    // Clear previous validation timeout on date-time value update to avoid
    // racing conditions
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    if (getValues("startSwitch") === "date") {
      const sDate = getValues("startDate");
      const sTime = getValues("startTime");
      const sUtc = getValues("startUtc");

      const canonicalSUtc = getCanonicalUtcOffset(sUtc);
      startDateTime = dayjs(`${sDate}T${sTime}${canonicalSUtc}`).toDate();
    } else {
      // adding one minute to startTime so that by the time comparison
      // rolls around, it's not in the past. Why is this so complicated?
      startDateTime = dayjs(
        `${getCanonicalDate()}T${getCanonicalTime({ minutes: 1 })}${getCanonicalUtcOffset()}`
      ).toDate();
    }

    const startMills = startDateTime.valueOf();

    // get the current time
    const currDateTime = new Date();
    const currMills = currDateTime.getTime();

    //build end date/time in utc mills
    const eDate = getValues("endDate");
    const eTime = getValues("endTime");
    const eUtc = getValues("endUtc");

    const canonicalEUtc = getCanonicalUtcOffset(eUtc);
    const endDateTime = dayjs(`${eDate}T${eTime}${canonicalEUtc}`).toDate();
    const endMills = endDateTime.valueOf();

    // get minimum end date time in mills
    const minEndDateTimeMills = startMills + minDurationMills;

    // get maximum end date time in mills
    const maxEndDateTimeMills = startMills + maxDurationMills;

    // set duration mills to avoid new calculation
    setValue("durationMills", endMills - startMills);

    // check start constraints
    // start time in the past
    if (startMills < currMills) {
      setValue("startTimeWarning", "Start time can’t be in the past.");

      validationTimeout = setTimeout(() => {
        // automatically correct the start date to now
        setValue("startDate", getCanonicalDate());
        setValue("startTime", getCanonicalTime({ minutes }));
        setValue("startUtc", currTimezone);
      }, CORRECTION_DELAY);

      // only validate first one if there is an error
      return true;
    }

    // start dateTime correct
    if (startMills >= currMills) {
      clearErrors("startDate");
      clearErrors("startTime");
      setValue("startTimeWarning", "");
    }

    //check end constraints
    // end date before min duration + start time
    if (endMills < minEndDateTimeMills) {
      setValue("endTimeWarning", minDurationAlert);

      validationTimeout = setTimeout(() => {
        // automatically correct the end date to minimum
        setValue("endDate", dayjs(minEndDateTimeMills).format("yyyy-MM-dd"));
        setValue("endTime", dayjs(minEndDateTimeMills).format("HH:mm"));
        setValue("endUtc", currTimezone);
      }, CORRECTION_DELAY);
    }

    // end date past maximum duration
    if (maxDurationMills !== 0 && endMills > maxEndDateTimeMills) {
      validationTimeout = setTimeout(() => {
        // automatically correct the end date to maximum
        setValue("endDate", dayjs(maxEndDateTimeMills).format("yyyy-MM-dd"));
        setValue("endTime", dayjs(maxEndDateTimeMills).format("HH:mm"));
        setValue("endUtc", currTimezone);
      }, CORRECTION_DELAY);
    }

    // end dateTime correct
    if (endMills >= minEndDateTimeMills) {
      clearErrors("endDate");
      clearErrors("endTime");
      setValue("endTimeWarning", "");
    }

    return true;
  }, [clearErrors, currTimezone, getValues, maxDurationMills, minDurationAlert, minDurationMills, minutes, setValue]);

  /*************************************************
   *                      Render                   *
   *************************************************/
  return (
    <div className="flex flex-col gap-y-3 rounded-xl border border-neutral-100 bg-neutral-0 p-4 md:flex-row md:gap-x-3 md:gap-y-0">
      <Controller
        name={`${mode}Date`}
        control={control}
        defaultValue={getCanonicalDate({ days })}
        rules={{
          required: "Date is required",
          validate: validator,
        }}
        render={({ field: { name, value, onChange, onBlur } }) => (
          <div className="w-full">
            <InputDate name={name} value={value} onChange={onChange} onBlur={onBlur} label="Date" />
          </div>
        )}
      />
      <Controller
        name={`${mode}Time`}
        control={control}
        defaultValue={getCanonicalTime({ hours, minutes })}
        rules={{
          required: "Time is required",
          validate: validator,
        }}
        render={({ field: { name, value, onChange, onBlur } }) => (
          <div className="w-full">
            <InputTime name={name} value={value} onChange={onChange} onBlur={onBlur} label="Time" />
          </div>
        )}
      />
    </div>
  );
};

export default DateTimeSelector;
