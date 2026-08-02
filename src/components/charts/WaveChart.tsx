import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface Props { data: { month: string; amount: number; owed: number }[] }

export default function WaveChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cViolet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="cCyan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" axisLine={false} tickLine={false}
          tick={{ fill: "rgba(248,250,252,0.4)", fontSize: 11 }} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: "rgba(13,11,38,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f8fafc", fontSize: 13 }}
          formatter={(v: number) => [`₹${v.toLocaleString()}`]}
        />
        <Area type="monotone" dataKey="amount" stroke="#a855f7" strokeWidth={2.5}
          fill="url(#cViolet)" dot={false} />
        <Area type="monotone" dataKey="owed" stroke="#14b8a6" strokeWidth={2}
          fill="url(#cCyan)" dot={false} strokeDasharray="4 2" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
