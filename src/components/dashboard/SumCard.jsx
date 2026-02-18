import { fmt } from "../../utils/format";
import S from "../../styles/shared";

export default function SumCard({ label, value, c }) {
  return (
    <div style={S.sumCard}>
      <div style={S.sumLabel}>{label}</div>
      <div style={{ ...S.sumValue, color: c }}>¥{fmt(value)}</div>
    </div>
  );
}
