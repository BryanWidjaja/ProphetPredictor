import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const theme = {
  axis: "#cbd5e1",
  tooltipBg: "#111827",
  tooltipText: "#f9fafb",
  actual_line: "#765bee",
  predict_line: "#ee9f5b",
  bound_line: "#ffcc95",
};

function ComparisonChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <XAxis
          dataKey="date"
          angle={90}
          textAnchor="start"
          height={80}
          tick={{ fontSize: 12, fill: theme.axis }}
        />

        <YAxis tick={{ fontSize: 12, fill: theme.axis }} width={40} />

        <Tooltip
          contentStyle={{
            backgroundColor: theme.tooltipBg,
            color: theme.tooltipText,
          }}
        />

        <Legend />

        <Line
          type="monotone"
          dataKey="upper"
          stroke={theme.bound_line}
          strokeDasharray="4 4"
          strokeWidth={1}
          dot={false}
        />

        <Line
          type="monotone"
          dataKey="lower"
          stroke={theme.bound_line}
          strokeDasharray="4 4"
          strokeWidth={1}
          dot={false}
        />

        <Line
          type="monotone"
          dataKey="actual"
          stroke={theme.actual_line}
          strokeWidth={3}
          dot={false}
          name="Actual"
        />

        <Line
          type="monotone"
          dataKey="predicted"
          stroke={theme.predict_line}
          strokeDasharray="4 4"
          strokeWidth={3}
          dot={false}
          name="Predicted"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default ComparisonChart;
