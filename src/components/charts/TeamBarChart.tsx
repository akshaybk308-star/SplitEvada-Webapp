import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip, Cell, CartesianGrid,
} from "recharts";

interface DataPoint { label: string; amount: number; isSelected?: boolean }
interface Props { data: DataPoint[]; mode: "monthly" | "daily" }

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-sm" style={{ border: "1px solid rgba(124,58,237,0.4)" }}>
      <p className="text-white/60 text-xs mb-1">{label}</p>
      <p className="font-bold text-white">₹{Number(payload[0].value).toLocaleString("en-IN")}</p>
    </div>
  );
}

export default function TeamBarChart({ data, mode }: Props) {
  const max = Math.max(...data.map(d => d.amount), 1);

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="25%">
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="label"
          axisLine={false} tickLine={false}
          tick={{ fill: "rgba(248,250,252,0.4)", fontSize: mode === "daily" ? 9 : 11 }}
          interval={mode === "daily" ? 3 : 0}
        />
        <YAxis hide domain={[0, max * 1.2]} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={28}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.isSelected
                ? "url(#barGradientActive)"
                : entry.amount > 0
                  ? "url(#barGradient)"
                  : "rgba(255,255,255,0.08)"}
            />
          ))}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5eead4" stopOpacity={1} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.7} />
            </linearGradient>
          </defs>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
