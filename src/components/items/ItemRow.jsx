import { fmt } from "../../utils/format";
import S from "../../styles/shared";

export default function ItemRow({ item, onEdit, onDelete }) {
  const isInc = item.type === "income";
  const isOne = item.recurring === false;
  return (
    <div style={S.itemRow}>
      <div style={S.itemLeft}>
        <div style={{ ...S.itemDot, backgroundColor: isInc ? "#22c55e" : "#ef4444" }} />
        <div>
          <div style={S.itemName}>
            {item.name}
            {isOne && <span style={S.badgeOnce}>単発</span>}
          </div>
          <div style={S.itemMeta}>
            {item.category}
            {!isOne && item.day ? ` ・ 毎月${item.day}日` : ""}
            {isOne && item.specificMonth ? ` ・ ${item.specificMonth}` : ""}
            {!isOne && item.endMonth && item.endMonth !== "9999-12" ? ` ・ 〜${item.endMonth}` : ""}
            {item.memo ? ` ・ ${item.memo}` : ""}
          </div>
        </div>
      </div>
      <div style={S.itemRight}>
        <div style={{ ...S.itemAmt, color: isInc ? "#22c55e" : "#ef4444" }}>
          {isInc ? "+" : "-"}¥{fmt(item.amount)}
        </div>
        <div style={S.itemActions}>
          <button style={S.actBtn} onClick={() => onEdit(item)}>編集</button>
          <button style={{ ...S.actBtn, color: "#ef4444" }}
            onClick={() => onDelete(item.id)}>削除</button>
        </div>
      </div>
    </div>
  );
}
