import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const theme = {
  axis: "#cbd5e1",
  tooltipBg: "#111827",
  tooltipText: "#f9fafb",
  predict_line: "#38bdf8",
  bound_line: "#79ccef",
};

function ForecastChart({ data }) {
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
        <YAxis tick={{ fontSize: 12, fill: theme.axis }} />

        <Tooltip
          contentStyle={{
            backgroundColor: theme.tooltipBg,
            color: theme.tooltipText,
          }}
        />

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
          dataKey="predicted"
          stroke={theme.predict_line}
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export default ForecastChart;
