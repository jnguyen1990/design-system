/* Budgeter mockup round — shared fixture data + chart helpers.
   Fixture month: September 2026, "today" = Sep 11 (11 of 30 days elapsed).
   Numbers are internally consistent across every mockup page. */

const M = {
  month: 'September 2026',
  daysElapsed: 11,
  daysInMonth: 30,
  daysLeft: 19,

  goal: 4800.00,
  allocated: 4650.00,
  spent: 2992.35,

  // Fixed = bills already committed/paid; variable = everything discretionary.
  fixedSpent: 2176.40,
  variableSpent: 815.95,
  variableAllocated: 2280.00,
  billsRemaining: 110.00,      // phone, posts ~18th

  income: 5840.00,
  transactions: 96,
  uncategorized: 7,
  categoriesUsed: 14,
  categoriesTotal: 17,

  groups: [
    { name: 'Bills', cats: [
      { name: 'Rent',          dot: 'blue',   alloc: 1650.00, spent: 1650.00, status: 'done',  note: 'paid sep 1',    prev: 1650.00 },
      { name: 'Insurance',     dot: 'teal',   alloc:  185.00, spent:  185.00, status: 'done',  note: 'paid sep 2',    prev:  185.00 },
      { name: 'Childcare',     dot: 'indigo', alloc:  150.00, spent:  150.00, status: 'done',  note: 'paid sep 3',    prev:  150.00 },
      { name: 'Internet',      dot: 'teal',   alloc:   95.00, spent:   95.00, status: 'done',  note: 'paid sep 5',    prev:   95.00 },
      { name: 'Utilities',     dot: 'teal',   alloc:  180.00, spent:   96.40, status: 'good',  note: '',              prev:  171.22 },
      { name: 'Phone',         dot: 'teal',   alloc:  110.00, spent:    0.00, status: 'due',   note: 'due sep 18',    prev:  110.00 }
    ]},
    { name: 'Everyday', cats: [
      { name: 'Groceries',     dot: 'green',  alloc:  800.00, spent:  312.18, status: 'good',  note: '',              prev:  780.44 },
      { name: 'Gas',           dot: 'red',    alloc:  220.00, spent:   84.50, status: 'good',  note: '',              prev:  196.10 },
      { name: 'Restaurants',   dot: 'orange', alloc:  100.00, spent:  108.65, status: 'over',  note: '',              prev:  152.30 },
      { name: 'Coffee',        dot: 'amber',  alloc:   60.00, spent:   22.75, status: 'good',  note: '',              prev:   58.40 }
    ]},
    { name: 'Discretionary', cats: [
      { name: 'Shopping',      dot: 'pink',   alloc:   90.00, spent:  110.40, status: 'over',  note: '',              prev:   64.99 },
      { name: 'Subscriptions', dot: 'purple', alloc:   85.00, spent:   54.97, status: 'warn',  note: 'projects to 82',prev:   82.96 },
      { name: 'Entertainment', dot: 'pink',   alloc:  120.00, spent:   45.00, status: 'good',  note: '',              prev:   96.00 },
      { name: 'Travel',        dot: 'indigo', alloc:  560.00, spent:    0.00, status: 'idle',  note: 'oct trip',      prev:    0.00 }
    ]},
    { name: 'Other', cats: [
      { name: 'Medical',       dot: 'red',    alloc:  100.00, spent:   12.50, status: 'good',  note: '',              prev:   45.00 },
      { name: 'Gifts',         dot: 'pink',   alloc:   80.00, spent:    0.00, status: 'idle',  note: '',              prev:  120.00 },
      { name: 'Fitness',       dot: 'green',  alloc:   65.00, spent:   65.00, status: 'done',  note: 'paid sep 1',    prev:   65.00 }
    ]}
  ],

  trend: [
    { month: 'apr', spending: 4412.18, budget: 4800 },
    { month: 'may', spending: 4689.02, budget: 4800 },
    { month: 'jun', spending: 4930.77, budget: 4800 },
    { month: 'jul', spending: 4512.40, budget: 4800 },
    { month: 'aug', spending: 4744.31, budget: 4800 },
    { month: 'sep', spending: 2992.35, budget: 4800 }
  ],

  upcoming: [
    { name: 'Phone',        dot: 'teal',   amount: 110.00, when: 'sep 18' },
    { name: 'Subscriptions',dot: 'purple', amount:  27.99, when: 'sep 22' },
    { name: 'Utilities',    dot: 'teal',   amount:  84.00, when: 'sep 28', est: true }
  ]
};

// Projection: spent so far + remaining fixed bills + (variable daily rate × days left)
M.variableDaily = M.variableSpent / M.daysElapsed;             // 74.18
M.projected     = M.spent + M.billsRemaining + M.variableDaily * M.daysLeft;  // 4511.77
M.available     = M.allocated - M.spent;                       // 1657.65
M.unallocated   = M.goal - M.allocated;                        // 150.00
M.monthPct      = M.daysElapsed / M.daysInMonth;               // 36.7%
M.variablePct   = M.variableSpent / M.variableAllocated;       // 35.8%

M.allCats = M.groups.flatMap(g => g.cats.map(c => ({ ...c, group: g.name })));

/* ── formatting ───────────────────────────────────────────────── */
function money(n, opts = {}) {
  const abs = Math.abs(n);
  const body = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: opts.round ? 0 : 2,
    maximumFractionDigits: opts.round ? 0 : 2
  }).format(abs);
  if (n < 0) return '−' + body;
  if (opts.sign === 'always' && n > 0) return '+' + body;
  return body;
}
function pct(n) { return Math.round(n * 100) + '%'; }

function groupTotals(g) {
  return g.cats.reduce((t, c) => ({
    alloc: t.alloc + c.alloc, spent: t.spent + c.spent, prev: t.prev + c.prev
  }), { alloc: 0, spent: 0, prev: 0 });
}
/* A category is only "warn" when it is meaningfully ahead of the month's own
   pace — NOT merely close to its ceiling. A fixed bill paid in full sits at
   exactly 100% and is the definition of on-plan, so it must read green. */
function meterClass(c) {
  if (c.spent > c.alloc) return 'over';
  if (c.spent === 0) return 'idle';
  if (c.status === 'done') return '';
  const used = c.alloc > 0 ? c.spent / c.alloc : 1;
  return used > M.monthPct + 0.20 ? 'warn' : '';
}
function meterWidth(c) {
  if (!c.alloc) return c.spent > 0 ? 100 : 0;
  return Math.min(100, (c.spent / c.alloc) * 100);
}
function statusBadge(c) {
  const map = {
    done: ['slate', 'Paid'],
    good: ['green', 'On track'],
    warn: ['amber', 'Watch'],
    over: ['red', 'Over'],
    due:  ['slate', 'Due'],
    idle: ['slate', 'Unused']
  };
  const [color, label] = map[c.status] || ['slate', ''];
  return `<span class="badge badge--${color}">${label}</span>`;
}

/* ── charts ───────────────────────────────────────────────────── */
function chartColor(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--' + name + '-9').trim();
  return v || fallback || '#888';
}
function chartText() {
  return getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#888';
}
function chartGrid() {
  return getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#ddd';
}

const CHARTS = {};

function renderTopCategoriesBar(canvasId, limit = 8) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;
  const rows = M.allCats.filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent).slice(0, limit);
  CHARTS[canvasId]?.destroy();
  CHARTS[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rows.map(c => c.name),
      datasets: [{
        data: rows.map(c => c.spent),
        backgroundColor: rows.map(c => chartColor(c.dot)),
        borderWidth: 0,
        borderRadius: 3,
        barThickness: 14
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => money(c.parsed.x) } }
      },
      scales: {
        x: { beginAtZero: true, grid: { color: chartGrid() }, ticks: { color: chartText(), font: { size: 11 }, callback: v => '$' + v } },
        y: { grid: { display: false }, ticks: { color: chartText(), font: { size: 11 } } }
      }
    }
  });
}

function renderTrendLine(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;
  const green = chartColor('green'), slate = chartColor('slate');
  CHARTS[canvasId]?.destroy();
  CHARTS[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: M.trend.map(d => d.month),
      datasets: [
        {
          label: 'Spending', data: M.trend.map(d => d.spending),
          borderColor: green, backgroundColor: `color-mix(in srgb, ${green} 12%, transparent)`,
          tension: 0.35, fill: true, pointRadius: 3, borderWidth: 2,
          segment: { borderDash: c => c.p1DataIndex === M.trend.length - 1 ? [4, 4] : undefined }
        },
        {
          label: 'Goal', data: M.trend.map(d => d.budget),
          borderColor: slate, borderDash: [5, 5], tension: 0, fill: false, pointRadius: 0, borderWidth: 1.5
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top', align: 'end', labels: { color: chartText(), boxWidth: 10, boxHeight: 10, font: { size: 11 }, usePointStyle: true, pointStyle: 'rectRounded' } },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${money(c.parsed.y)}` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: chartText(), font: { size: 11 } } },
        y: { beginAtZero: true, grid: { color: chartGrid() }, ticks: { color: chartText(), font: { size: 11 }, callback: v => '$' + (v / 1000).toFixed(1) + 'k' } }
      }
    }
  });
}

function renderDonut(canvasId, limit = 6) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;
  const rows = M.allCats.filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent).slice(0, limit);
  CHARTS[canvasId]?.destroy();
  CHARTS[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: rows.map(c => c.name), datasets: [{ data: rows.map(c => c.spent), backgroundColor: rows.map(c => chartColor(c.dot)), borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { position: 'right', labels: { color: chartText(), boxWidth: 10, boxHeight: 10, font: { size: 11 }, usePointStyle: true, pointStyle: 'rectRounded' } } }
    }
  });
}

/* Re-tint charts when the theme flips. */
document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  new MutationObserver(() => {
    Object.keys(CHARTS).forEach(id => {
      const fn = CHARTS[id]?.config?.type;
      if (fn === 'bar') renderTopCategoriesBar(id);
      else if (fn === 'line') renderTrendLine(id);
      else if (fn === 'doughnut') renderDonut(id);
    });
  }).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
});
