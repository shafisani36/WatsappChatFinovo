import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  {
    day: "Mon",
    productive: 72,
    nonProductive: 16,
    idle: 12,
  },
  {
    day: "Tue",
    productive: 78,
    nonProductive: 12,
    idle: 10,
  },
  {
    day: "Wed",
    productive: 81,
    nonProductive: 10,
    idle: 9,
  },
  {
    day: "Thu",
    productive: 75,
    nonProductive: 15,
    idle: 10,
  },
  {
    day: "Fri",
    productive: 84,
    nonProductive: 9,
    idle: 7,
  },
];

function ProductivityChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="productive"
            stackId="activity"
            fill="#0f172a"
            radius={[0, 0, 0, 0]}
          />

          <Bar
            dataKey="nonProductive"
            stackId="activity"
            fill="#94a3b8"
          />

          <Bar
            dataKey="idle"
            stackId="activity"
            fill="#e2e8f0"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProductivityChart;