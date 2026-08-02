import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#7c3aed","#14b8a6","#ec4899","#f59e0b","#84cc16","#06b6d4","#6366f1"];

interface Props { data: { name: string; value: number }[] }

export default function DonutChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
          dataKey="value" paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "rgba(13,11,38,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#f8fafc", fontSize: 13 }}
          formatter={(v: number) => [`₹${v.toLocaleString()}`]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
