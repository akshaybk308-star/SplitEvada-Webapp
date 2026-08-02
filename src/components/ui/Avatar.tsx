const COLORS = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-lime-500 to-green-600",
  "from-orange-500 to-amber-600",
  "from-blue-500 to-indigo-600",
];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % COLORS.length;
  return COLORS[Math.abs(h)];
}

export default function Avatar({ name, size = 36, src }: { name: string; size?: number; src?: string }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div
      className={`bg-gradient-to-br ${colorFor(name)} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
