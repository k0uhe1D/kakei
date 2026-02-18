import S from "../../styles/shared";

export default function MetricCard({ label, value, sub, color }) {
  return (
    <div style={S.metricCard}>
      <div style={S.metricLabel}>{label}</div>
      <div style={{ ...S.metricValue, color }}>{value}</div>
      <div style={S.metricSub}>{sub}</div>
    </div>
  );
}
