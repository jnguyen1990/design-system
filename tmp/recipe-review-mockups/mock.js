/* ═══════════════════════════════════════════════════════════════
   Recipe builder review round — shared fixture + renderers.
   One fixture across all three directions so they're comparable.

   The three drafts deliberately cover the three intake kinds Joe
   picked, at the two confidence levels the night job can produce:
     1. url   — clean schema.org parse            (high)
     2. image — photo of a cookbook page, vision  (low)
     3. text  — dictated dump, agent-expanded     (low)
   ═══════════════════════════════════════════════════════════════ */

const M = {};

M.drafts = [
  {
    id: 41,
    kind: 'url',
    confidence: 'high',
    queued: 'yesterday 8:12 pm',
    source: {
      url: 'https://www.seriouseats.com/gochujang-glazed-salmon',
      host: 'seriouseats.com',
      mode: 'parsed',
      note: 'schema.org Recipe found — every field below came off the page.'
    },
    accent: '#e8613a',
    name: 'Gochujang-glazed salmon sheet pan',
    servings: 4,
    total_time_min: 35,
    active_time_min: 15,
    components: ['protein', 'veg'],
    cadence: 'biweekly',
    leftover_potential: 'good',
    toddler_friendly: true,
    tags: ['Weeknight', 'Sheet-pan', 'Fish'],
    equipment: ['Oven', 'Sheet-pan'],
    macros: { kcal: 486, protein_g: 39, carbs_g: 18, fat_g: 27, fiber_g: 4 },
    macros_source: 'stated',
    guesses: [],
    ingredients: [
      { name: 'Salmon fillets, skin on', qty: '4',   unit: 'fillets', section: 'protein' },
      { name: 'Gochujang',               qty: '3',   unit: 'tbsp',    section: 'pantry'  },
      { name: 'Honey',                   qty: '2',   unit: 'tbsp',    section: 'pantry'  },
      { name: 'Rice vinegar',            qty: '1',   unit: 'tbsp',    section: 'pantry'  },
      { name: 'Toasted sesame oil',      qty: '2',   unit: 'tsp',     section: 'pantry'  },
      { name: 'Garlic, grated',          qty: '3',   unit: 'cloves',  section: 'produce' },
      { name: 'Broccolini',              qty: '1',   unit: 'lb',      section: 'produce' },
      { name: 'Scallions',               qty: '4',   unit: '',        section: 'produce' },
      { name: 'Toasted sesame seeds',    qty: '1',   unit: 'tbsp',    section: 'pantry'  }
    ],
    steps: [
      'Heat the oven to 425°F and line a sheet pan with parchment.',
      'Whisk the gochujang, honey, rice vinegar, sesame oil and garlic into a glaze.',
      'Toss the broccolini with oil and salt, spread on the pan, roast 8 minutes.',
      'Push the veg aside, add the salmon, brush generously with the glaze.',
      'Roast 10–12 minutes until the salmon flakes and the glaze has caught at the edges.',
      'Finish with scallions and sesame seeds.'
    ],
    notes: ''
  },
  {
    id: 42,
    kind: 'image',
    confidence: 'low',
    queued: 'yesterday 9:40 pm',
    source: {
      filename: 'IMG_4471.HEIC',
      label: 'Cookbook page — photographed',
      mode: 'vision',
      note: 'Read from a photo. The gutter of the page cut off part of the ingredient list.'
    },
    accent: '#7a6a4f',
    name: 'Braised white beans with fennel and lemon',
    servings: 4,
    total_time_min: 55,
    active_time_min: 20,
    components: ['protein', 'veg'],
    cadence: 'biweekly',
    leftover_potential: 'great',
    toddler_friendly: true,
    tags: ['Vegetarian', 'Braise', 'Make-ahead'],
    equipment: ['Dutch-oven'],
    macros: null,
    macros_source: 'absent',
    guesses: ['servings', 'components', 'total_time_min', 'ing:6'],
    ingredients: [
      { name: 'Dried cannellini beans, soaked', qty: '1',   unit: 'lb',    section: 'pantry'  },
      { name: 'Fennel bulb, thinly sliced',     qty: '2',   unit: '',      section: 'produce' },
      { name: 'Yellow onion',                   qty: '1',   unit: '',      section: 'produce' },
      { name: 'Garlic',                         qty: '6',   unit: 'cloves',section: 'produce' },
      { name: 'Olive oil',                      qty: '0.5', unit: 'cup',   section: 'pantry'  },
      { name: 'Lemon',                          qty: '1',   unit: '',      section: 'produce' },
      { name: 'Vegetable stock',                qty: '4',   unit: 'cups',  section: 'pantry', guess: true },
      { name: 'Bay leaves',                     qty: '2',   unit: '',      section: 'pantry'  },
      { name: 'Parmesan rind',                  qty: '1',   unit: '',      section: 'dairy'   }
    ],
    steps: [
      'Drain the soaked beans and put them in a Dutch oven with the stock, bay and parmesan rind.',
      'Bring to a bare simmer, cover, and cook 40 minutes until tender but not collapsing.',
      'Meanwhile soften the fennel, onion and garlic in a generous amount of olive oil.',
      'Stir the softened vegetables into the beans and cook another 10 minutes.',
      'Finish off the heat with lemon zest, juice and a lot of black pepper.'
    ],
    notes: 'From the Ottolenghi book on the shelf — p.184.'
  },
  {
    id: 43,
    kind: 'text',
    confidence: 'low',
    queued: 'today 7:02 am',
    source: {
      label: 'Pasted / dictated',
      mode: 'text',
      raw: "mom's beef and daikon soup\n\nbeef shank, daikon, ginger, star anise,\nsoy, a bit of rock sugar. brown the beef\nfirst then simmer like 2 hrs. daikon goes\nin at the end so it doesn't turn to mush.\nserve with rice. toddler likes the daikon",
      note: 'No structure to parse — steps and quantities below are the agent’s expansion.'
    },
    accent: '#8c3f3f',
    name: "Mom's beef and daikon soup",
    servings: 6,
    total_time_min: 150,
    active_time_min: 25,
    components: ['protein', 'veg'],
    cadence: 'monthly',
    leftover_potential: 'great',
    toddler_friendly: true,
    tags: ['Braise', 'Make-ahead', 'Soup'],
    equipment: ['Dutch-oven'],
    macros: null,
    macros_source: 'absent',
    guesses: ['servings', 'total_time_min', 'active_time_min', 'components', 'steps', 'ing:0', 'ing:1'],
    ingredients: [
      { name: 'Beef shank, cut crosswise', qty: '2',  unit: 'lb',    section: 'protein', guess: true },
      { name: 'Daikon',                    qty: '1',  unit: 'large', section: 'produce', guess: true },
      { name: 'Ginger, sliced',            qty: '1',  unit: 'thumb', section: 'produce' },
      { name: 'Star anise',                qty: '2',  unit: 'pods',  section: 'pantry'  },
      { name: 'Soy sauce',                 qty: '3',  unit: 'tbsp',  section: 'pantry'  },
      { name: 'Rock sugar',                qty: '1',  unit: 'tbsp',  section: 'pantry'  }
    ],
    steps: [
      'Brown the beef shank hard on all sides in a dry-ish pot, then set aside.',
      'Add the ginger and star anise to the fat and let them bloom.',
      'Return the beef, cover with water, add soy and rock sugar, simmer 2 hours.',
      'Add the daikon in large chunks for the last 25 minutes so it keeps its shape.',
      'Taste for salt and serve over rice.'
    ],
    notes: ''
  }
];

/* ── helpers ──────────────────────────────────────────────────── */
M.esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

M.SECTIONS = ['produce', 'protein', 'dairy', 'pantry', 'frozen', 'other'];
M.CADENCES = ['weekly', 'biweekly', 'triweekly', 'monthly', 'fallback'];
M.SLOTS = ['protein', 'veg', 'starch'];

M.kindLabel = k => ({ url: 'link', image: 'photo', text: 'pasted' }[k] || k);
M.kindIco   = k => ({ url: 'tag', image: 'file-text', text: 'list' }[k] || 'inbox');

/* Whole-draft flag (Joe's call 2026-09-11 — per-field provenance was
   judged more build than it was worth). Two states, nothing finer.   */
M.confBadge = d => d.confidence === 'high'
  ? '<span class="badge badge--green">Clean parse</span>'
  : '<span class="badge badge--amber">Needs a look</span>';

M.thumb = (d, size) => '<div class="dish-thumb ' + (size || '') + '" style="background:' +
  d.accent + '">' + M.esc(d.name[0].toUpperCase()) + '</div>';

M.summaryLine = d => [
  d.ingredients.length + ' ingredients',
  d.total_time_min + ' min',
  d.components.join(' + ') || 'side',
  d.servings + ' servings'
].join(' · ');

/* `guesses` / `guess:` survive in the fixture only to decide which drafts
   read as "needs a look". Per-field provenance is not rendered any more. */

/* ── source evidence ──────────────────────────────────────────── */
M.renderSource = function (d) {
  let body;
  if (d.kind === 'image') {
    body = '<div class="src-photo">' +
      '<i class="h"></i><i class="w85"></i><i class="w70"></i><i></i><i class="w45"></i>' +
      '<i class="s"></i><i class="w70"></i><i class="w85"></i><i></i><i class="w45"></i>' +
      '</div>' +
      '<div class="src-meta"><span class="nav-ico" data-ico="file-text"></span>' +
      M.esc(d.source.filename) + '<span style="margin-left:auto"><button class="btn btn-ghost btn-sm">Open full size</button></span></div>';
  } else if (d.kind === 'text') {
    body = '<div class="src-text">' + M.esc(d.source.raw) + '</div>' +
      '<div class="src-meta"><span class="nav-ico" data-ico="list"></span>' +
      M.esc(d.source.label) + '</div>';
  } else {
    body = '<div class="src-photo" style="aspect-ratio:16/10;background:' + d.accent + '22">' +
      '<i class="h"></i><i class="w85"></i><i class="w70"></i>' +
      '</div>' +
      '<div class="src-meta"><span class="nav-ico" data-ico="tag"></span>' +
      '<a href="#" style="color:var(--text-muted)">' + M.esc(d.source.host) + '</a>' +
      '<span style="margin-left:auto"><button class="btn btn-ghost btn-sm">Open source</button></span></div>';
  }
  return '<div class="src-frame">' + body + '</div>' +
    '<p class="card-subtitle" style="margin-top:var(--space-3)">' + M.esc(d.source.note) + '</p>';
};

/* ── editable draft sections ──────────────────────────────────── */
M.renderIdentity = function (d) {
  return '' +
  '<div class="d-field" style="margin-bottom:var(--space-3)">' +
    '<label>Name</label>' +
    '<input class="form-control" value="' + M.esc(d.name) + '">' +
  '</div>' +
  '<div class="d-grid thirds">' +
    '<div class="d-field"><label>Servings</label>' +
      '<input class="form-control" type="number" value="' + d.servings + '"></div>' +
    '<div class="d-field"><label>Total time (min)</label>' +
      '<input class="form-control" type="number" value="' + d.total_time_min + '"></div>' +
    '<div class="d-field"><label>Active time (min)</label>' +
      '<input class="form-control" type="number" value="' + d.active_time_min + '"></div>' +
  '</div>';
};

M.renderSlots = function (d) {
  const chips = M.SLOTS.map(s => {
    const on = d.components.indexOf(s) !== -1;
    return '<label class="choice-chip">' +
      '<input type="checkbox"' + (on ? ' checked' : '') + '><span>' + s + '</span></label>';
  }).join('');
  const cad = M.CADENCES.map(c =>
    '<option' + (c === d.cadence ? ' selected' : '') + '>' + c + '</option>').join('');
  return '' +
  '<div class="d-grid">' +
    '<div class="d-field"><label>Fills</label>' +
      '<div class="choice-chip-row">' + chips + '</div></div>' +
    '<div class="d-field">' +
      '<label>Rotation cadence</label>' +
      '<select class="form-control"><option value="">— not in rotation —</option>' + cad + '</select>' +
      '<span style="display:inline-block;font-size:11px;color:var(--text-faint);margin-top:3px">joins the dinner rotation on accept</span>' +
    '</div>' +
  '</div>';
};

M.renderIngredients = function (d) {
  const rows = d.ingredients.map((g, i) => {
    const sect = M.SECTIONS.map(s =>
      '<option' + (s === g.section ? ' selected' : '') + '>' + s + '</option>').join('');
    return '<tr>' +
      '<td class="col-narrow"><input class="form-control" value="' + M.esc(g.qty) + '"></td>' +
      '<td class="col-short"><input class="form-control" value="' + M.esc(g.unit) + '"></td>' +
      '<td><input class="form-control" value="' + M.esc(g.name) + '"></td>' +
      '<td class="col-select"><select class="form-control">' + sect + '</select></td>' +
      '<td class="col-action"><button class="btn btn-ghost btn-sm" aria-label="Remove">&times;</button></td>' +
      '</tr>';
  }).join('');
  return '<table class="edit-rows"><tbody>' + rows + '</tbody></table>' +
    '<div class="row-actions" style="margin-top:var(--space-2)">' +
      '<button class="btn btn-secondary btn-sm">+ ingredient</button></div>';
};

M.renderSteps = function (d) {
  const rows = d.steps.map((s, i) =>
    '<div class="step-row"><span class="step-n">' + (i + 1) + '</span>' +
    '<textarea class="form-control">' + M.esc(s) + '</textarea>' +
    '<button class="btn btn-ghost btn-sm" aria-label="Remove">&times;</button></div>').join('');
  return '<div class="step-rows">' + rows + '</div>' +
    '<div class="row-actions" style="margin-top:var(--space-2)">' +
      '<button class="btn btn-secondary btn-sm">+ step</button></div>';
};

M.renderMeta = function (d) {
  const tagChips = d.tags.map(t =>
    '<span class="badge badge--purple">' + M.esc(t) + ' <span style="opacity:.6">&times;</span></span>').join(' ');
  const eqChips = d.equipment.map(t =>
    '<span class="badge badge--orange">' + M.esc(t) + ' <span style="opacity:.6">&times;</span></span>').join(' ');
  const macro = d.macros
    ? '<div class="d-grid thirds" style="margin-top:var(--space-2)">' +
      ['kcal', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g'].map(k =>
        '<div class="d-field"><label>' + k.replace('_g', ' g') + '</label>' +
        '<input class="form-control" value="' + d.macros[k] + '"></div>').join('') + '</div>'
    : '<p class="card-subtitle" style="margin:0">Not stated in the source — left blank rather than estimated.</p>';
  return '' +
  '<div class="d-field" style="margin-bottom:var(--space-3)"><label>Tags</label><div>' + tagChips +
    ' <button class="btn btn-ghost btn-sm">+ tag</button></div></div>' +
  '<div class="d-field" style="margin-bottom:var(--space-3)"><label>Equipment</label><div>' + eqChips +
    ' <button class="btn btn-ghost btn-sm">+ equipment</button></div></div>' +
  '<div class="d-grid" style="margin-bottom:var(--space-3)">' +
    '<div class="d-field"><label>Leftover potential</label>' +
      '<select class="form-control">' + ['none', 'good', 'great'].map(o =>
        '<option' + (o === d.leftover_potential ? ' selected' : '') + '>' + o + '</option>').join('') +
      '</select></div>' +
    '<div class="d-field"><label>Toddler friendly</label>' +
      '<div style="padding-top:6px"><input type="checkbox"' + (d.toddler_friendly ? ' checked' : '') + '></div></div>' +
  '</div>' +
  '<div class="d-field"><label>Macros (per serving)</label>' + macro + '</div>';
};

M.renderNotes = function (d) {
  return '<textarea class="form-control" rows="2" placeholder="Pre-cook notes…">' +
    M.esc(d.notes) + '</textarea>';
};

/* Full editable body, used by all three directions. */
M.renderDraftBody = function (d) {
  const card = (title, inner, sub) =>
    '<div class="card"><div class="card-header"><h3 class="card-title">' + title + '</h3>' +
    (sub ? '<span class="card-subtitle">' + sub + '</span>' : '') + '</div>' + inner + '</div>';
  return '<div class="card-stack">' +
    card('The dish', M.renderIdentity(d) +
      '<div style="margin-top:var(--space-4)">' + M.renderSlots(d) + '</div>') +
    card('Ingredients', M.renderIngredients(d), 'Section drives grocery-list grouping') +
    card('Method', M.renderSteps(d)) +
    card('Metadata', M.renderMeta(d)) +
    card('Notes', M.renderNotes(d)) +
    '</div>';
};

/* Shared page chrome bits */
M.sidebar = function (active, reviewHref) {
  const items = [
    ['today', 'star', '1', '#'],
    ['recipes', 'book', '2', 'capture.html'],
    ['grocery list', 'cart', '3', '#'],
    ['sales', 'tag', '4', '#'],
    ['products', 'package', '5', '#'],
    ['nutrition', 'pie-chart', '6', '#'],
    ['settings', 'sliders', ',', '#']
  ];
  return '<nav class="sidebar">' +
    '<div class="sidebar-header"><div class="brand brand-title">' +
      '<span class="brand-logo"><img src="icon.svg" alt=""></span>Mealplanner</div></div>' +
    '<div class="nav-section"><ul class="nav-menu">' +
    items.map(([label, ico, key, href]) =>
      '<li><a href="' + href + '" class="nav-link' + (label === active ? ' active' : '') + '">' +
      '<span class="nav-ico" data-ico="' + ico + '"></span>' + label +
      '<kbd class="kbd nav-kbd">⌘' + key + '</kbd></a></li>').join('') +
    '</ul></div><div class="sidebar-footer"></div></nav>';
};

M.mount = function (active) {
  document.body.insertAdjacentHTML('afterbegin',
    '<button class="mobile-menu-toggle" id="mobileMenuBtn">&#9776;</button>' +
    '<div class="mobile-overlay" id="mobileOverlay"></div>' + M.sidebar(active));
};

