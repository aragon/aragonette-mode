import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import React from "react";
import { type ContentType } from "recharts/types/component/Tooltip";
import { DateFormat, formatterUtils, NumberFormat } from "@aragon/ods";

const renderContent: ContentType<string[], string> = ({ active, payload }) => {
  if (!active || !payload?.length) return undefined;

  const { val, date } = payload[0].payload;

  const parsedDate =
    date.getTime() - new Date().getTime() < 0
      ? "Now"
      : (formatterUtils.formatDate(date.getTime(), { format: DateFormat.RELATIVE }) ?? "");

  const parsedVal = formatterUtils.formatNumber(val, { format: NumberFormat.GENERIC_SHORT }) ?? "";
  //const parsedRewards = formatterUtils.formatNumber(rewards, { format: NumberFormat.GENERIC_SHORT }) ?? "";

  return (
    <div className="flex flex-col gap-y-2 rounded-xl border border-primary-500 bg-neutral-0 p-3 shadow-tooltip">
      <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
        <p className="flex-1">Date</p>
        <p className="font-semibold text-neutral-800">{parsedDate}</p>
      </div>
      <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
        <p className="flex-1">Voting Power</p>
        <p className="font-semibold text-neutral-800">{parsedVal}</p>
      </div>
    </div>
  );
};

const generatePoints = (startDate: Date, endDate: Date, amount: number, steps: number) => {
  const dataPoints: { val: number; date: Date; rewards: number }[] = [];
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  const step = totalDays / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const currentDate = new Date(startDate.getTime() + i * step * 24 * 60 * 60 * 1000);
    const val = ((i * amount) / (steps - 1)) * 5 + amount; // Linear interpolation from 0 to 6
    dataPoints.push({
      val: val,
      date: currentDate,
      rewards: val * 0.05,
    });
  }

  return dataPoints;
};

const MultiplyerChart: React.FC<{ amount: number }> = ({ amount }) => {
  const startDate = new Date();
  const endDate = new Date(new Date().getTime() + 1000 * 3600 * 24 * 7 * 10); // 10 weeks

  const dataPoints: { val: number; date: Date }[] = generatePoints(startDate, endDate, amount, 10);

  return (
    <ResponsiveContainer width="100%" height={350} className="-my-3">
      <AreaChart data={dataPoints} className="py-3" margin={{ left: -40 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#e0fe00" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#e0fe00" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
          }}
          dataKey="date"
          className="text-xs"
          domain={[startDate.getTime(), endDate.getTime()]}
          tickLine={false}
          axisLine={true}
          type="number"
          tickCount={dataPoints.length * 2}
        />
        <YAxis
          tickFormatter={(value) => formatterUtils.formatNumber(value, { format: NumberFormat.GENERIC_SHORT }) ?? ""}
          className="text-xs"
          domain={[0, Math.max(...dataPoints.map((point) => point.val))]}
          tickLine={false}
          axisLine={true}
          type="number"
          tickCount={dataPoints.length + 1}
          dataKey="val"
        />
        <Tooltip content={renderContent} cursor={true} allowEscapeViewBox={{ x: false, y: true }} />
        <Area
          className="border"
          type="monotone"
          dataKey="val"
          stroke="rgb(var(--ods-color-primary-500))"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MultiplyerChart;
