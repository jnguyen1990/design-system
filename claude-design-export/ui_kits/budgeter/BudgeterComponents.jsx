// Budgeter components — accounts, transactions, budget rings

function AccountsBar({ accounts }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
      {accounts.map((a) => (
        <div key={a.id} className="card card-sm">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{a.label}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500, color: 'var(--text)' }}>{a.balance}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: a.deltaPositive ? 'var(--green-11)' : 'var(--text-muted)', marginTop: 4 }}>
            {a.delta}
          </div>
        </div>
      ))}
    </div>
  );
}

function TxTable({ rows, onSelect, selectedId }) {
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th style={{ width: 72 }}>Date</th>
          <th style={{ minWidth: 280 }}>Description</th>
          <th style={{ width: 140 }}>Category</th>
          <th style={{ width: 110 }}>Account</th>
          <th className="num" style={{ width: 120 }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} onClick={() => onSelect && onSelect(r.id)} style={{ cursor: 'pointer', background: r.id === selectedId ? 'var(--bg-subtle)' : undefined }}>
            <td className="text-num text-muted">{r.date}</td>
            <td style={{ fontWeight: 500 }}>
              {r.desc}
              {r.note ? <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginTop: 2 }}>{r.note}</div> : null}
            </td>
            <td><span className={'badge badge-' + r.catColor}><span className="badge-dot"></span>{r.cat}</span></td>
            <td className="text-num text-muted" style={{ fontSize: 12 }}>{r.account}</td>
            <td className="num" style={{ color: r.amount.startsWith('+') ? 'var(--green-11)' : 'var(--text)' }}>{r.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BudgetRow({ label, spent, budget, color }) {
  const pct = Math.min(100, (spent / budget) * 100);
  const over = spent > budget;
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className={'sb-dot sb-dot-' + color} style={{ width: 8, height: 8, borderRadius: '50%' }}></div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: over ? 'var(--red-11)' : 'var(--text-muted)' }}>
          ${spent.toFixed(2)} / ${budget.toFixed(2)}
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--panel)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct + '%', background: over ? 'var(--red-9)' : 'var(--' + color + '-9)' }}></div>
      </div>
    </div>
  );
}

Object.assign(window, { AccountsBar, TxTable, BudgetRow });
