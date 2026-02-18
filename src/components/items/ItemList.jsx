import ItemRow from "./ItemRow";
import S from "../../styles/shared";

export default function ItemList({ items, onEdit, onDelete }) {
  const recurring = items.filter(i => i.recurring !== false);
  const oneTime = items.filter(i => i.recurring === false);
  return (
    <div style={S.section}>
      <h2 style={S.sectionTitle}>定期的な収支（{recurring.length}件）</h2>
      {recurring.length === 0 && <div style={S.emptySmall}>登録なし</div>}
      {recurring.map(it => <ItemRow key={it.id} item={it} onEdit={onEdit} onDelete={onDelete} />)}

      <h2 style={{ ...S.sectionTitle, marginTop: 24 }}>単発の収支（{oneTime.length}件）</h2>
      {oneTime.length === 0 && <div style={S.emptySmall}>登録なし</div>}
      {oneTime.map(it => <ItemRow key={it.id} item={it} onEdit={onEdit} onDelete={onDelete} />)}
    </div>
  );
}
