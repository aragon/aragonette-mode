import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import React from "react";
import { type ContentType } from "recharts/types/component/Tooltip";
import { formatterUtils, NumberFormat } from "@aragon/ods";
import { type Token } from "../../types/tokens";
import { useGetCoefficients } from "../../hooks/useGetCoefficients";
import { formatUnits } from "viem";
import { useGetMaxBias } from "../../hooks/useGetMaxBias";

const renderContent: ContentType<string[], string> = ({ active, payload }) => {
  if (!active || !payload?.length) return undefined;

  const { val, week } = payload[0].payload;

  const parsedWeek = week <= 0 ? "Now" : `In ${week} weeks`;
  const parsedVal = formatterUtils.formatNumber(val, { format: NumberFormat.GENERIC_SHORT }) ?? "";

  return (
    <div className="flex flex-col gap-y-2 rounded-xl border border-primary-500 bg-neutral-0 p-3 shadow-tooltip">
      <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
        <p className="flex-1">Date</p>
        <p className="font-semibold text-neutral-800">{parsedWeek}</p>
      </div>
      <div className="flex gap-x-[10.91px] text-base leading-tight text-neutral-500">
        <p className="flex-1">Voting Power</p>
        <p className="font-semibold text-neutral-800">{parsedVal}</p>
      </div>
    </div>
  );
};

const quadraticEquation = (a: number, b: number, c: number) => {
  const discriminant = b ** 2 - 4 * a * c;
  if (discriminant < 0) return [];
  if (discriminant === 0) return [-b / (2 * a)];
  return [(-b + Math.sqrt(discriminant)) / (2 * a), (-b - Math.sqrt(discriminant)) / (2 * a)];
};

const parabolaEcuation = (x: number, a: number, b: number, c: number) => a * x ** 2 + b * x + c;

const generatePoints = (coefficients: number[], maxBias: number, startDate: Date, amount: number) => {
  const dataPoints: { val: number; date: Date; week: number }[] = [];
  const maxTime = quadraticEquation(coefficients[2], coefficients[1], coefficients[0] - maxBias)[0] ?? 6048000;
  const numPoints = maxTime / (86400 * 7);
  const timeStep = maxTime / numPoints;

  for (let i = 0; i < numPoints; i++) {
    const val = parabolaEcuation(i * timeStep, coefficients[2], coefficients[1], coefficients[0]);
    dataPoints.push({
      val: val * amount,
      date: new Date(startDate.getTime() + i * timeStep * 1000),
      week: i,
    });
  }

  dataPoints.push({
    val: parabolaEcuation(maxTime, coefficients[2], coefficients[1], coefficients[0]) * amount,
    date: new Date(startDate.getTime() + maxTime * 1000),
    week: maxTime / (86400 * 7),
  });

  return dataPoints;
};

const MultiplierChart: React.FC<{ amount: number; token: Token }> = ({ amount, token }) => {
  const { coefficients } = useGetCoefficients(token);
  const { maxBias } = useGetMaxBias(token);
  const parsedMaxBias = Number(formatUnits(maxBias ?? 6n, 18));
  const parsedCoefficients = coefficients?.map((coef) => Number(formatUnits(coef, 18))) ?? [
    1, 2.36205593348e-7, 9.7637e-14,
  ];
  const startDate = new Date();
  const endDate = new Date(new Date().getTime() + 1000 * 3600 * 24 * 7 * 10); // 10 weeks

  const dataPoints: { val: number; date: Date }[] = generatePoints(
    parsedCoefficients,
    parsedMaxBias,
    startDate,
    amount
  );

  return (
    <ResponsiveContainer width="100%" height={400} className="-my-3">
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
          tickCount={dataPoints.length}
        />
        <YAxis
          tickFormatter={(value) => formatterUtils.formatNumber(value, { format: NumberFormat.GENERIC_SHORT }) ?? ""}
          className="text-xs"
          width={80}
          domain={[0, dataPoints[dataPoints.length - 1].val]}
          tickLine={false}
          axisLine={true}
          type="number"
          tickCount={10}
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

export default MultiplierChart;
