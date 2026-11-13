import { useId, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { activityByPeriod } from "../../data/demo";
import { formatNumber } from "../../lib/format";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useWorkspace } from "../../state/workspace";
import { Panel } from "../ui/panel";
import { SegmentedControl } from "../ui/segmented-control";

type Period = "6h" | "24h" | "7d";
const periods = [
  { value: "6h", label: "6h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
] as const;

function ChartTooltip({
  active = false,
  payload = [],
  label,
}: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <p key={String(item.dataKey)}>
          <span>{item.dataKey === "events" ? "Registrados" : "Período anterior"}</span>
          <span className="mono">{formatNumber(Number(item.value ?? 0))}</span>
        </p>
      ))}
    </div>
  );
}

export function ActivityPanel() {
  const [period, setPeriod] = useState<Period>("24h");
  const gradientId = `activity-${useId().replaceAll(":", "")}`;
  const data = activityByPeriod[period];
  const total = data.reduce((sum, point) => sum + point.events, 0);
  const { preferences } = useWorkspace();
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const animate = !preferences.reduceMotion && !systemReduced;
  return (
    <Panel
      title="Atividade operacional"
      subtitle={`${formatNumber(total)} registros · ${period === "7d" ? "últimos 7 dias" : `últimas ${period.replace("h", " horas")}`}`}
      action={
        <SegmentedControl
          value={period}
          options={periods}
          onChange={setPeriod}
          label="Período do gráfico"
        />
      }
    >
      <div
        className="chart-wrap"
        role="group"
        aria-label={`Gráfico de eventos: ${formatNumber(total)} registros no período. Os valores também estão disponíveis na tabela abaixo.`}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 12, left: -8, bottom: 4 }}
            accessibilityLayer
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 4" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-subtle)", fontSize: 11 }}
              minTickGap={24}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-subtle)", fontSize: 11 }}
              allowDecimals={false}
              width={38}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "var(--color-border-strong)", strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="previous"
              name="Período anterior"
              stroke="var(--color-text-subtle)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
              isAnimationActive={animate}
            />
            <Area
              type="monotone"
              dataKey="events"
              name="Registrados"
              stroke="var(--color-accent)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, stroke: "var(--color-surface)", strokeWidth: 2 }}
              isAnimationActive={animate}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-line" />
          Registrados
        </span>
        <span className="legend-item">
          <span className="legend-line legend-line--previous" />
          Período anterior
        </span>
      </div>
      <details className="chart-data">
        <summary>Ver dados em tabela</summary>
        <div
          className="data-table-wrapper"
          tabIndex={0}
          role="region"
          aria-label="Dados do gráfico de atividade"
        >
          <table className="data-table">
            <caption className="sr-only">Valores do gráfico por intervalo</caption>
            <thead>
              <tr>
                <th scope="col">Intervalo</th>
                <th scope="col">Registrados</th>
                <th scope="col">Anterior</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.label}>
                  <td data-label="Intervalo">{point.label}</td>
                  <td data-label="Registrados" className="mono">
                    {point.events}
                  </td>
                  <td data-label="Anterior" className="mono">
                    {point.previous}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Panel>
  );
}
