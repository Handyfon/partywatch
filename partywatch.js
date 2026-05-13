const partywatchGetProperty = (object, path) => {
  if (!object || !path) return undefined;
  const getPropertyFn = foundry?.utils?.getProperty || globalThis.getProperty;
  if (getPropertyFn) return getPropertyFn(object, path);
  return String(path).split(".").reduce((value, key) => value?.[key], object);
};

Hooks.once('init', () => {
  console.log("PartyWatch | Registering settings...");

    game.settings.register('partywatch', 'hpPath', {
      name: 'HP Data Path',
      hint: 'This is the path that points towards the HP value of an actor (standard DnD5e: system.attributes.hp.value)',
      scope: 'world',
      config: true,
      default: "system.attributes.hp.value",
      type: String,
      onChange: () => window.location.reload()
  });	
  game.settings.register('partywatch', 'maxhpPath', {
      name: 'Max HP Data Path',
      hint: 'This is the path that points towards the HP value of an actor (standard DnD5e: system.attributes.hp.max)',
      scope: 'world',
      config: true,
      default: "system.attributes.hp.max",
      type: String,
      onChange: () => window.location.reload()
  });
  game.settings.register('partywatch', 'tempHpPath', {
      name: 'Temp HP Data Path',
      hint: 'Path to current temporary HP. Shown as a blue shield overlay on the health bar. (DnD5e default: system.attributes.hp.temp). Leave empty to disable.',
      scope: 'world',
      config: true,
      default: "system.attributes.hp.temp",
      type: String,
      onChange: () => refreshPartyWatch()
  });
  game.settings.register('partywatch', 'tempMaxHpPath', {
      name: 'Temp Max HP Data Path',
      hint: 'Path to temporary max HP — added to max HP for total bar width. (DnD5e default: system.attributes.hp.tempmax). Leave empty to disable.',
      scope: 'world',
      config: true,
      default: "system.attributes.hp.tempmax",
      type: String,
      onChange: () => refreshPartyWatch()
  });
  game.settings.register('partywatch', 'enableExtraAttributes', {
      name: 'Enable Extra Attributes',
      hint: 'Show the configured extra attribute badges/bars under each player entry.',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
      onChange: () => refreshPartyWatch()
  });
  game.settings.register('partywatch', 'extraAttributesGMOnly', {
      name: 'Extra Attributes — GM Only',
      hint: 'When on, only the GM sees the extra attributes (players still see HP & temp HP normally).',
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
      onChange: () => refreshPartyWatch()
  });
  game.settings.register('partywatch', 'extraAttributes', {
      name: 'Extra Attributes',
      hint: 'Additional attribute badges shown under each entry (AC, Passive Perception, mana, etc.). Managed via the "Manage Attributes" button in the in-game settings dialog.',
      scope: 'world',
      config: false,
      default: [
        { id: 'ac', label: 'AC', currentPath: 'system.attributes.ac.value', maxPath: '', color: '#cbd5e1', type: 'badge', icon: 'shield-halved' },
        { id: 'pp', label: 'PP', currentPath: 'system.skills.prc.passive', maxPath: '', color: '#a5b4fc', type: 'badge', icon: 'eye' }
      ],
      type: Object,
      onChange: () => refreshPartyWatch()
  });
  game.settings.register('partywatch', 'companionActorType', {
      name: 'Companion Actor Type',
      hint: 'Actor type used for companions / familiars / summons. If a player owns a token of this type that is currently on the scene, it appears next to their main entry as a smaller card. (DnD5e default: "npc"). Leave empty to disable companions.',
      scope: 'world',
      config: true,
      default: 'npc',
      type: String,
      onChange: () => refreshPartyWatch()
  });

	game.settings.register('partywatch', 'wounds', {
    name: 'Invert HP (More HP BAD)',
    hint: 'Use a different calculation where more hp == bad for systems like swade',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
    onChange: () => window.location.reload()
  });	

  game.settings.register('partywatch', 'overlayPosition', {
    name: 'Overlay Position (Top, Left in VH)',
    hint: 'Overlay position on the screen. Example: 10,10',
    scope: 'client',
    config: false,
    default: '10,10',
    type: String,
    onChange: () => updateOverlayPosition()
  });

  game.settings.register('partywatch', 'showForPlayers', {
    name: 'Show for Players',
    hint: 'Allow non-GMs to see the Party Watch overlay.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
    onChange: () => refreshPartyWatch()
  });

  game.settings.register('partywatch', 'showOffline', {
    name: 'Show Offline Players',
    hint: 'Also show actors of players who are offline.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
    onChange: () => refreshPartyWatch()
  });

  game.settings.register('partywatch', 'nameDisplay', {
    name: 'Show Actor Names',
    hint: 'Show names of characters below their portraits.',
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
    onChange: () => refreshPartyWatch()
  });
  game.settings.register('partywatch', 'showPortraits', {
    name: 'Show Portraits',
    hint: 'Show or hide the character portraits in the overlay.',
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
    onChange: () => refreshPartyWatch()
  });
  
  game.settings.register('partywatch', 'barPosition', {
    name: 'Health Bar Position',
    hint: 'Place the health bar below the portrait, or as a vertical-portrait overlay (the bar sits over the bottom of a taller portrait).',
    scope: 'client',
    config: true,
    choices: {
      'below':   'Below Portrait',
      'overlay': 'Overlay on Portrait (vertical)'
    },
    default: 'below',
    type: String,
    onChange: () => refreshPartyWatch()
  });
  game.settings.register('partywatch', 'hpColorScheme', {
    name: 'HP Bar Color Scheme',
    hint: 'Change HP bar color dynamically.',
    scope: 'client',
    config: true,
    choices: {
      'dynamic':   'Dynamic (Red / Yellow / Green)',
      'static':    'Static Green',
      'staticRed': 'Static Red'
    },
    default: 'dynamic',
    type: String,
    onChange: () => refreshPartyWatch()
  });

  game.settings.register('partywatch', 'scale', {
    name: 'Overlay Scale',
    hint: 'Adjust the size of the overlay.',
    scope: 'client',
    config: true,
    type: Number,
    default: 1,
    range: { min: 0.5, max: 2, step: 0.1 },
    onChange: () => updateOverlayScale()
  });

  game.settings.register('partywatch', 'overlayLayout', {
    name: 'Overlay Layout',
    hint: 'Arrange entries side-by-side or vertically.',
    scope: 'client',
    config: true,
    choices: {
      'flex': 'Side-by-Side',
      'block': 'Stacked Vertically'
    },
    default: 'block',
    type: String,
    onChange: () => updateOverlayLayout()
  });
  game.settings.register('partywatch', 'backgroundOpacity', {
    name: 'Overlay Background Opacity',
    hint: 'Transparency of the background behind the party entries.',
    scope: 'client',
    config: true,
    type: Number,
    default: 0.5,
    range: { min: 0, max: 1, step: 0.05 },
    onChange: () => updateOverlayBackground()
  });
  game.settings.register('partywatch', 'showHealthDetails', {
    name: 'Show Health Details',
    hint: 'Display current and max HP as text on the health bar.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
    onChange: () => refreshPartyWatch()
  });
  game.settings.register('partywatch', 'healthDisplayMode', {
    name: 'Health Display Mode',
    hint: 'Choose how to display health: exact numbers or descriptive estimates.',
    scope: 'client',
    config: true,
    choices: {
      'numbers': 'Numbers (e.g., 9/12)',
      'estimate': 'Estimate (e.g., Injured, Near Death)'
    },
    default: 'numbers',
    type: String,
    onChange: () => refreshPartyWatch()
  });
  game.settings.register('partywatch', 'portraitSource', {
    name: 'Portrait Image Source',
    hint: 'Choose whether to show the Actor portrait or the current Token image.',
    scope: 'client',
    config: true,
    choices: {
      'actor': 'Actor Portrait',
      'token': 'Token Image'
    },
    default: 'actor',
    type: String,
    onChange: () => refreshPartyWatch()
  });
  
  game.settings.register('partywatch', 'tintPortrait', {
    name: 'Tint Portrait by Health',
    hint: 'Tint the portrait image depending on current health.',
    scope: 'client',
    config: true,
    default: false,
    type: Boolean,
    onChange: () => refreshPartyWatch()
  });
  game.settings.register('partywatch', 'tintMode', {
    name: 'Portrait Tint Mode',
    hint: 'Choose if portraits are darkened or colored by health.',
    scope: 'client',
    config: true,
    choices: {
      'none': 'No Tint',
      'darken': 'Darken on Low Health',
      'color': 'Colorize by Health'
    },
    default: 'none',
    type: String,
    onChange: () => refreshPartyWatch()
  });
  game.settings.register('partywatch', 'backgroundColor', {
    name: 'Overlay Background Color',
    hint: 'Change the background color of the Party Watch overlay.',
    scope: 'client',
    config: true,
    default: '#000000',
    type: String,
    onChange: () => updateOverlayBackground()
  });
  game.settings.register('partywatch', 'hasSeenRecommendation', {
    hint: 'If true disables the setup that appears when enabling the module for the first time',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });  
  game.settings.register('partywatch', 'overlayVisible', {
    name: 'Overlay Visible',
    hint: 'Show or hide the PartyWatch overlay.',
    scope: 'client',
    config: false,
    type: Boolean,
    default: true,
    onChange: () => applyOverlayVisibility()
  });
  game.settings.register('partywatch', 'onlyInScene', {
    name: 'Only Players In Current Scene',
    hint: 'Only show party members whose tokens are placed in the currently viewed scene. Combined with "Show Offline Players" to further restrict the list.',
    scope: 'client',
    config: true,
    type: Boolean,
    default: false,
    onChange: () => refreshPartyWatch()
  });
});

function applyOverlayVisibility() {
  const overlay = document.getElementById('partywatch-overlay');
  if (!overlay) return;
  const visible = game.settings.get('partywatch', 'overlayVisible') ?? true;
  if (visible) {
    const layout = game.settings.get('partywatch', 'overlayLayout') || 'flex';
    overlay.style.display = layout;
  } else {
    overlay.style.display = 'none';
  }
}

/* ===== GM → ALL PLAYERS SETTING PUSH ====================================
   Client-scoped settings can't be edited remotely by the GM directly, so the
   GM broadcasts their current values over a socket and each player applies
   them locally on their own client.
   ====================================================================== */
const PARTYWATCH_CLIENT_KEYS = [
  'overlayLayout', 'nameDisplay', 'showPortraits', 'scale', 'hpColorScheme',
  'backgroundOpacity', 'backgroundColor', 'tintMode', 'healthDisplayMode',
  'portraitSource', 'onlyInScene'
];

async function pushPartywatchDefaultsToPlayers() {
  if (!game.user.isGM) return;
  const payload = {};
  for (const key of PARTYWATCH_CLIENT_KEYS) {
    payload[key] = game.settings.get('partywatch', key);
  }
  game.socket.emit('module.partywatch', { type: 'applyDefaults', settings: payload });
  ui.notifications?.info?.('PartyWatch | Pushed view settings to all players.');
}

/* ===== EXTRA ATTRIBUTES EDITOR =========================================== */
async function openPartywatchAttributeEditor() {
  if (!game.user.isGM) {
    ui.notifications?.warn?.('PartyWatch | Only the GM can edit extra attributes.');
    return;
  }
  let attrs = partywatchGetAttributes().map(a => ({ ...a }));
  const buildRows = () => attrs.map((a, i) => `
    <tr data-index="${i}">
      <td><input type="text" class="pwa-label" value="${(a.label || '').replace(/"/g, '&quot;')}" placeholder="AC"></td>
      <td><input type="text" class="pwa-path"  value="${(a.currentPath || '').replace(/"/g, '&quot;')}" placeholder="system.attributes.ac.value"></td>
      <td><input type="text" class="pwa-maxpath" value="${(a.maxPath || '').replace(/"/g, '&quot;')}" placeholder="(optional)"></td>
      <td><input type="color" class="pwa-color" value="${a.color || '#cbd5e1'}"></td>
      <td>
        <select class="pwa-type">
          <option value="badge"  ${a.type === 'badge'  ? 'selected' : ''}>Badge</option>
          <option value="number" ${a.type === 'number' ? 'selected' : ''}>Number</option>
          <option value="bar"    ${a.type === 'bar'    ? 'selected' : ''}>Bar</option>
        </select>
      </td>
      <td><input type="text" class="pwa-icon" value="${(a.icon || '').replace(/"/g, '&quot;')}" placeholder="shield-halved"></td>
      <td><button type="button" class="pwa-delete" title="Remove">×</button></td>
    </tr>
  `).join('');

  const content = `
    <div class="partywatch-attr-editor">
      <p class="pwa-hint">Each row adds an extra readout under every player entry. Use data paths the same way as HP (e.g. <code>system.attributes.ac.value</code>). Icons are <a href="https://fontawesome.com/search?ic=free" target="_blank" rel="noopener">FontAwesome</a> names without the <code>fa-</code> prefix — e.g. <code>shield-halved</code>, <code>eye</code>, <code>dragon</code>, <code>flask</code>, <code>microchip</code>.</p>
      <table class="pwa-table">
        <thead>
          <tr>
            <th>Label</th><th>Path</th><th>Max Path</th><th>Color</th><th>Type</th><th>Icon</th><th></th>
          </tr>
        </thead>
        <tbody class="pwa-rows">${buildRows()}</tbody>
      </table>
      <button type="button" class="pwa-add"><i class="fas fa-plus"></i> Add Attribute</button>
    </div>
  `;

  const collectFromDOM = (html) => {
    const out = [];
    html.find('tr[data-index]').each((_, row) => {
      const $r = $(row);
      out.push({
        id:          out.length + '_' + Date.now().toString(36),
        label:       $r.find('.pwa-label').val()   || '',
        currentPath: $r.find('.pwa-path').val()    || '',
        maxPath:     $r.find('.pwa-maxpath').val() || '',
        color:       $r.find('.pwa-color').val()   || '#cbd5e1',
        type:        $r.find('.pwa-type').val()    || 'badge',
        icon:        $r.find('.pwa-icon').val()    || ''
      });
    });
    return out.filter(a => a.currentPath);
  };

  const dialog = new Dialog({
    title: 'PartyWatch — Manage Extra Attributes',
    content,
    buttons: {
      save: {
        icon: '<i class="fas fa-save"></i>',
        label: 'Save',
        callback: html => {
          const next = collectFromDOM(html);
          game.settings.set('partywatch', 'extraAttributes', next);
          refreshPartyWatch();
        }
      },
      reset: {
        icon: '<i class="fas fa-rotate-left"></i>',
        label: 'Reset to Defaults',
        callback: () => {
          const defaults = [
            { id: 'ac', label: 'AC', currentPath: 'system.attributes.ac.value', maxPath: '', color: '#cbd5e1', type: 'badge', icon: 'shield-halved' },
            { id: 'pp', label: 'PP', currentPath: 'system.skills.prc.passive', maxPath: '', color: '#a5b4fc', type: 'badge', icon: 'eye' }
          ];
          game.settings.set('partywatch', 'extraAttributes', defaults);
          refreshPartyWatch();
        }
      },
      cancel: { icon: '<i class="fas fa-times"></i>', label: 'Cancel' }
    },
    default: 'save'
  }, { classes: ['dialog', 'partywatch-dialog', 'partywatch-attr-editor-dialog'], width: 720 });

  dialog.render(true);

  Hooks.once('renderDialog', (app, html) => {
    const $body = html.find('.pwa-rows');
    html.find('.pwa-add').on('click', () => {
      attrs = collectFromDOM(html);
      attrs.push({ id: 'new_' + Date.now().toString(36), label: '', currentPath: '', maxPath: '', color: '#cbd5e1', type: 'badge', icon: '' });
      $body.html(buildRows());
    });
    $body.on('click', '.pwa-delete', e => {
      const idx = +$(e.currentTarget).closest('tr').attr('data-index');
      attrs = collectFromDOM(html);
      attrs.splice(idx, 1);
      $body.html(buildRows());
    });
  });
}

async function applyReceivedPartywatchDefaults(settings) {
  if (!settings || typeof settings !== 'object') return;
  for (const [key, value] of Object.entries(settings)) {
    if (!PARTYWATCH_CLIENT_KEYS.includes(key)) continue;
    try { await game.settings.set('partywatch', key, value); } catch (e) { /* swallow per-key */ }
  }
  refreshPartyWatch();
  updateOverlayLayout();
  updateOverlayScale();
  updateOverlayBackground();
  applyOverlayVisibility();
  ui.notifications?.info?.('PartyWatch | GM applied a shared view.');
}

Hooks.once('ready', () => {
  game.socket.on('module.partywatch', (msg) => {
    if (!msg) return;
    if (msg.type === 'applyDefaults' && !game.user.isGM) {
      applyReceivedPartywatchDefaults(msg.settings);
    }
  });
});

Hooks.once('ready', () => {
  console.log("PartyWatch | Initializing...");

  if (!game.user.isGM && !game.settings.get('partywatch', 'showForPlayers')) return;

  createPartywatchOverlay();
  refreshPartyWatch();
  applyOverlayVisibility();

  Hooks.on('updateActor', refreshPartyWatch);
  Hooks.on('controlToken', refreshPartyWatch);
  Hooks.on('renderPlayerList', refreshPartyWatch);
  // Scene & token presence hooks for "Only Players In Current Scene"
  Hooks.on('canvasReady', refreshPartyWatch);
  Hooks.on('canvasInit', refreshPartyWatch);
  Hooks.on('canvasTearDown', refreshPartyWatch);
  Hooks.on('createToken', refreshPartyWatch);
  Hooks.on('deleteToken', refreshPartyWatch);
  Hooks.on('updateToken', (_doc, change) => {
    if ('actorId' in change) refreshPartyWatch();
  });
});

Hooks.on("getSceneControlButtons", (controls) => {
  const tokensControl = controls;
  if (tokensControl) {
    tokensControl.tokens.tools["partywatch-toggle"] = {
      name: "partywatch-toggle",
      title: "Toggle PartyWatch Overlay",
      icon: "fas fa-users",
      toggle: true,
      active: game.settings.get('partywatch', 'overlayVisible') ?? true,
      onClick: toggled => {
        game.settings.set('partywatch', 'overlayVisible', toggled);
        const overlay = document.getElementById('partywatch-overlay');
        if (!overlay) return;
        if (toggled) {
          refreshPartyWatch();
        }
        applyOverlayVisibility();
      }
    };
  }
});


/* ===== HP CHANGE TRACKING & ANIMATIONS =================================
   Each client keeps its own Map of last-known HP per actor so every viewer
   (not just the actor's owner) gets damage / heal animations.
   ===================================================================== */
const partywatchLastHp = new Map();

Hooks.on('updateActor', (actor) => {
  if (!actor) return;
  const { hp: currentHp, max, tempMax } = getActorHp(actor);
  const effectiveMax = (max || 0) + (tempMax || 0);
  const prevHp = partywatchLastHp.get(actor.id);
  partywatchLastHp.set(actor.id, currentHp);
  if (typeof prevHp !== 'number' || prevHp === currentHp || !effectiveMax) return;
  // Animate AFTER the entry refresh has rebuilt the DOM. updateActor hooks
  // fire in registration order; refreshPartyWatch is already registered first
  // and runs synchronously, so a microtask is enough.
  Promise.resolve().then(() => animateBarChange(actor, prevHp, currentHp, effectiveMax));
});

function findPartywatchEntry(actorId) {
  const container = document.getElementById('partywatch-overlay');
  if (!container) return null;
  return container.querySelector(`.partywatch-entry[data-actor-id="${actorId}"]`);
}

function animateBarChange(actor, prevHp, currentHp, max) {
  const entry = findPartywatchEntry(actor.id);
  if (!entry) return;

  const damageBar = entry.querySelector('.partywatch-bar-damage');
  const innerBar = entry.querySelector('.partywatch-bar-inner');
  const barEl = entry.querySelector('.partywatch-bar');
  if (!damageBar || !innerBar) return;

  const wounds = game.settings.get('partywatch', 'wounds');
  const toPct = v => {
    let p = Math.clamped(Math.floor((v / (max || 1)) * 100), 0, 100);
    if (wounds) p = 100 - p;
    return p;
  };
  const prevPct = toPct(prevHp);
  const newPct  = toPct(currentHp);
  const isDamage = currentHp < prevHp;
  const isHeal   = currentHp > prevHp;

  // refreshPartyWatch() has already repainted the entry at the new width, so
  // to actually animate we need to snap back to the OLD width first (no
  // transition + reflow), then enable the transition and set the new width.

  if (isDamage) {
    // 1. Inner fill: visibly drop OLD → NEW over a short, punchy ease.
    innerBar.style.transition = 'none';
    innerBar.style.width = prevPct + '%';
    innerBar.style.background = getHPBarColor(prevPct);
    void innerBar.offsetWidth;
    innerBar.style.transition = 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s var(--pw-ease)';
    innerBar.style.width = newPct + '%';
    innerBar.style.background = getHPBarColor(newPct);
    if (barEl) barEl.style.backgroundColor = partywatchDarkenColor(getHPBarColor(newPct), 0.22);

    // 2. Damage buffer: pin at OLD width, hold, then tick down to NEW width.
    damageBar.style.transition = 'none';
    damageBar.style.width = prevPct + '%';
    damageBar.classList.add('is-flashing');
    void damageBar.offsetWidth;
    damageBar.style.transition = 'width 0.7s cubic-bezier(0.6, 0, 0.3, 1) 0.4s';
    damageBar.style.width = newPct + '%';

    setTimeout(() => damageBar.classList.remove('is-flashing'), 1200);

    // Portrait shake + red flash
    const img = entry.querySelector('.partywatch-img');
    if (img) {
      img.classList.add('partywatch-damage-shake');
      setTimeout(() => img.classList.remove('partywatch-damage-shake'), 600);
    }
  } else if (isHeal) {
    // 1. Heal preview: snap buffer to the FINAL width (green) — player sees the target.
    damageBar.classList.add('is-healing');
    damageBar.style.transition = 'none';
    damageBar.style.width = newPct + '%';
    void damageBar.offsetWidth;
    damageBar.style.transition = 'width 0s';

    // 2. Inner fill: snap back to OLD width with no transition, then slowly
    //    grow OLD → NEW over ~1.1s with a satisfying eased fill.
    innerBar.style.transition = 'none';
    innerBar.style.width = prevPct + '%';
    innerBar.style.background = getHPBarColor(prevPct);
    void innerBar.offsetWidth;
    innerBar.style.transition = 'width 1.1s cubic-bezier(0.22, 1, 0.36, 1), background 0.6s var(--pw-ease)';
    innerBar.style.width = newPct + '%';
    innerBar.style.background = getHPBarColor(newPct);
    if (barEl) barEl.style.backgroundColor = partywatchDarkenColor(getHPBarColor(newPct), 0.22);

    // 3. Restore buffer style after the heal completes.
    setTimeout(() => damageBar.classList.remove('is-healing'), 1300);
    entry.classList.add('partywatch-heal-pulse');
    setTimeout(() => entry.classList.remove('partywatch-heal-pulse'), 1300);
  }
}


function createPartywatchOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'partywatch-overlay';

  const dragbar = document.createElement('div');
  dragbar.id = 'partywatch-dragbar';
  dragbar.innerHTML = `<div id="partywatch-cog">⚙️</div>`;

  overlay.appendChild(dragbar);
  document.body.appendChild(overlay);

  dragElement(overlay, dragbar);

  applyOverlayVisibility();

  document.getElementById('partywatch-cog').addEventListener('click', async () => {
    const isGM = game.user.isGM;
    const initialSettings = {
      overlayLayout: game.settings.get('partywatch', 'overlayLayout'),
      barPosition: game.settings.get('partywatch', 'barPosition') ?? 'below',
      nameDisplay: game.settings.get('partywatch', 'nameDisplay'),
      showPortraits: game.settings.get('partywatch', 'showPortraits'),
      scale: game.settings.get('partywatch', 'scale'),
      hpColorScheme: game.settings.get('partywatch', 'hpColorScheme'),
      backgroundOpacity: game.settings.get('partywatch', 'backgroundOpacity') ?? 0.5,
      backgroundColor: game.settings.get('partywatch', 'backgroundColor'),
      tintMode: game.settings.get('partywatch', 'tintMode'),
      onlyInScene: game.settings.get('partywatch', 'onlyInScene') ?? false,
      healthDisplayMode: game.settings.get('partywatch', 'healthDisplayMode') ?? 'numbers',
      portraitSource: game.settings.get('partywatch', 'portraitSource') ?? 'actor',
      showOffline: game.settings.get('partywatch', 'showOffline') ?? true,
      showHealthDetails: game.settings.get('partywatch', 'showHealthDetails') ?? true,
      wounds: game.settings.get('partywatch', 'wounds') ?? false,
      enableExtraAttributes: game.settings.get('partywatch', 'enableExtraAttributes') ?? true,
      extraAttributesGMOnly: game.settings.get('partywatch', 'extraAttributesGMOnly') ?? false
    };

    let confirmed = false; // Neu: merken ob gespeichert wurde

    const gmOnlySection = isGM ? `
        <div style="grid-column: 1 / -1; margin-top: 4px;">
          <label style="opacity:0.7; font-size:10px;">— GM Only —</label>
        </div>
        <div>
          <label>Show Offline Players:</label>
          <input type="checkbox" id="pw-showOffline" ${initialSettings.showOffline ? 'checked' : ''}>
        </div>
        <div>
          <label>Show Health Details:</label>
          <input type="checkbox" id="pw-showHealthDetails" ${initialSettings.showHealthDetails ? 'checked' : ''}>
        </div>
        <div>
          <label>Invert HP (Wounds):</label>
          <input type="checkbox" id="pw-wounds" ${initialSettings.wounds ? 'checked' : ''}>
        </div>
        <div>
          <label>Enable Extra Attributes:</label>
          <input type="checkbox" id="pw-enableExtraAttributes" ${initialSettings.enableExtraAttributes ? 'checked' : ''}>
        </div>
        <div>
          <label>Extra Attributes — GM Only:</label>
          <input type="checkbox" id="pw-extraAttributesGMOnly" ${initialSettings.extraAttributesGMOnly ? 'checked' : ''}>
        </div>
        <div class="partywatch-push-row">
          <label>Apply My View to Players:</label>
          <button type="button" id="pw-pushDefaults" class="partywatch-push-btn">Push to All</button>
        </div>
        <div class="partywatch-push-row">
          <label>Extra Attributes:</label>
          <button type="button" id="pw-manageAttrs" class="partywatch-push-btn partywatch-push-btn-alt">Manage Attributes</button>
        </div>
    ` : '';

    const content = `
      <div class="partywatch-settings">
        <div>
          <label>Layout:</label>
          <select id="pw-layout">
            <option value="flex" ${initialSettings.overlayLayout === 'flex' ? 'selected' : ''}>Side-by-Side</option>
            <option value="block" ${initialSettings.overlayLayout === 'block' ? 'selected' : ''}>Stacked Vertically</option>
          </select>
        </div>
        <div>
          <label>HP Bar Position:</label>
          <select id="pw-barPosition">
            <option value="below"   ${initialSettings.barPosition === 'below'   ? 'selected' : ''}>Below Portrait</option>
            <option value="overlay" ${initialSettings.barPosition === 'overlay' ? 'selected' : ''}>Overlay on Portrait</option>
          </select>
        </div>
        <div>
          <label>HP Bar Color:</label>
          <select id="pw-hpColor">
            <option value="dynamic" ${initialSettings.hpColorScheme === 'dynamic' ? 'selected' : ''}>Dynamic (Red / Yellow / Green)</option>
            <option value="static" ${initialSettings.hpColorScheme === 'static' ? 'selected' : ''}>Static Green</option>
            <option value="staticRed" ${initialSettings.hpColorScheme === 'staticRed' ? 'selected' : ''}>Static Red</option>
          </select>
        </div>
        <div>
          <label>Health Display Mode:</label>
          <select id="pw-healthDisplayMode">
            <option value="numbers" ${initialSettings.healthDisplayMode === 'numbers' ? 'selected' : ''}>Numbers (9/12)</option>
            <option value="estimate" ${initialSettings.healthDisplayMode === 'estimate' ? 'selected' : ''}>Estimate (Injured…)</option>
          </select>
        </div>
        <div>
          <label>Portrait Source:</label>
          <select id="pw-portraitSource">
            <option value="actor" ${initialSettings.portraitSource === 'actor' ? 'selected' : ''}>Actor Portrait</option>
            <option value="token" ${initialSettings.portraitSource === 'token' ? 'selected' : ''}>Token Image</option>
          </select>
        </div>
        <div>
          <label>Portrait Tint Mode:</label>
          <select id="pw-tintMode">
            <option value="none" ${initialSettings.tintMode === 'none' ? 'selected' : ''}>No Tint</option>
            <option value="darken" ${initialSettings.tintMode === 'darken' ? 'selected' : ''}>Darken on Low Health</option>
            <option value="color" ${initialSettings.tintMode === 'color' ? 'selected' : ''}>Colorize by Health</option>
          </select>
        </div>
        <div>
          <label>Scale:</label>
          <input type="range" id="pw-scale" min="0.5" max="2" step="0.1" value="${initialSettings.scale}">
        </div>
        <div>
          <label>Background Transparency:</label>
          <input type="range" id="pw-background" min="0" max="1" step="0.05" value="${initialSettings.backgroundOpacity}">
        </div>
        <div>
          <label>Background Color:</label>
          <input type="color" id="pw-backgroundColor" value="${initialSettings.backgroundColor}">
        </div>
        <div>
          <label>Show Names:</label>
          <input type="checkbox" id="pw-nameDisplay" ${initialSettings.nameDisplay ? 'checked' : ''}>
        </div>
        <div>
          <label>Show Portraits:</label>
          <input type="checkbox" id="pw-showPortraits" ${initialSettings.showPortraits ? 'checked' : ''}>
        </div>
        <div>
          <label>Only Show When In Scene:</label>
          <input type="checkbox" id="pw-onlyInScene" ${initialSettings.onlyInScene ? 'checked' : ''}>
        </div>
        ${gmOnlySection}
      </div>
    `;
  
    const dialog = new Dialog({
      title: "Party Watch Settings",
      content,
      buttons: {
        save: {
          label: "Save",
          callback: () => {
            confirmed = true; // Save gedrückt
          }
        },
        cancel: {
          label: "Cancel Changes",
          callback: () => {
            confirmed = false; // Cancel gedrückt
            resetSettings();
          }
        }
      },
      default: "save",
      close: () => {
        if (!confirmed) {
          resetSettings(); // Nur zurücksetzen wenn nicht gespeichert
        }
      }
    }, { classes: ['dialog', 'partywatch-dialog'] });
  
    dialog.render(true);
  
    Hooks.once("renderDialog", (app, html) => {
      html.find('#pw-layout').on('change', e => {
        game.settings.set('partywatch', 'overlayLayout', e.target.value);
        updateOverlayLayout();
        refreshPartyWatch();
      });
      html.find('#pw-barPosition').on('change', e => {
        game.settings.set('partywatch', 'barPosition', e.target.value);
        refreshPartyWatch();
      });
      html.find('#pw-nameDisplay').on('change', e => {
        game.settings.set('partywatch', 'nameDisplay', e.target.checked);
        refreshPartyWatch();
      });
      html.find('#pw-scale').on('input', e => {
        game.settings.set('partywatch', 'scale', parseFloat(e.target.value));
        updateOverlayScale();
        refreshPartyWatch();
      });
      html.find('#pw-hpColor').on('change', e => {
        game.settings.set('partywatch', 'hpColorScheme', e.target.value);
        refreshPartyWatch();
      });
      html.find('#pw-background').on('input', e => {
        game.settings.set('partywatch', 'backgroundOpacity', parseFloat(e.target.value));
        updateOverlayBackground();
      });
      html.find('#pw-tintMode').on('change', e => {
        game.settings.set('partywatch', 'tintMode', e.target.value);
        refreshPartyWatch();
      });
      html.find('#pw-showPortraits').on('change', e => {
        game.settings.set('partywatch', 'showPortraits', e.target.checked);
        refreshPartyWatch();
      });
      html.find('#pw-backgroundColor').on('input', e => {
        game.settings.set('partywatch', 'backgroundColor', e.target.value);
        updateOverlayBackground();
      });
      html.find('#pw-onlyInScene').on('change', e => {
        game.settings.set('partywatch', 'onlyInScene', e.target.checked);
        refreshPartyWatch();
      });
      html.find('#pw-healthDisplayMode').on('change', e => {
        game.settings.set('partywatch', 'healthDisplayMode', e.target.value);
        refreshPartyWatch();
      });
      html.find('#pw-portraitSource').on('change', e => {
        game.settings.set('partywatch', 'portraitSource', e.target.value);
        refreshPartyWatch();
      });
      // GM-only fields
      html.find('#pw-showOffline').on('change', e => {
        game.settings.set('partywatch', 'showOffline', e.target.checked);
        refreshPartyWatch();
      });
      html.find('#pw-showHealthDetails').on('change', e => {
        game.settings.set('partywatch', 'showHealthDetails', e.target.checked);
        refreshPartyWatch();
      });
      html.find('#pw-wounds').on('change', e => {
        game.settings.set('partywatch', 'wounds', e.target.checked);
        refreshPartyWatch();
      });
      html.find('#pw-enableExtraAttributes').on('change', e => {
        game.settings.set('partywatch', 'enableExtraAttributes', e.target.checked);
        refreshPartyWatch();
      });
      html.find('#pw-extraAttributesGMOnly').on('change', e => {
        game.settings.set('partywatch', 'extraAttributesGMOnly', e.target.checked);
        refreshPartyWatch();
      });
      html.find('#pw-pushDefaults').on('click', async () => {
        await pushPartywatchDefaultsToPlayers();
      });
      html.find('#pw-manageAttrs').on('click', () => {
        openPartywatchAttributeEditor();
      });
    });

    async function resetSettings() {
      await game.settings.set('partywatch', 'overlayLayout', initialSettings.overlayLayout);
      await game.settings.set('partywatch', 'barPosition', initialSettings.barPosition);
      await game.settings.set('partywatch', 'nameDisplay', initialSettings.nameDisplay);
      await game.settings.set('partywatch', 'showPortraits', initialSettings.showPortraits);
      await game.settings.set('partywatch', 'scale', initialSettings.scale);
      await game.settings.set('partywatch', 'hpColorScheme', initialSettings.hpColorScheme);
      await game.settings.set('partywatch', 'backgroundOpacity', initialSettings.backgroundOpacity);
      await game.settings.set('partywatch', 'backgroundColor', initialSettings.backgroundColor);
      await game.settings.set('partywatch', 'tintMode', initialSettings.tintMode);
      await game.settings.set('partywatch', 'onlyInScene', initialSettings.onlyInScene);
      await game.settings.set('partywatch', 'healthDisplayMode', initialSettings.healthDisplayMode);
      await game.settings.set('partywatch', 'portraitSource', initialSettings.portraitSource);
      if (isGM) {
        await game.settings.set('partywatch', 'showOffline', initialSettings.showOffline);
        await game.settings.set('partywatch', 'showHealthDetails', initialSettings.showHealthDetails);
        await game.settings.set('partywatch', 'wounds', initialSettings.wounds);
        await game.settings.set('partywatch', 'enableExtraAttributes', initialSettings.enableExtraAttributes);
        await game.settings.set('partywatch', 'extraAttributesGMOnly', initialSettings.extraAttributesGMOnly);
      }
      refreshPartyWatch();
      updateOverlayLayout();
      updateOverlayScale();
      updateOverlayBackground();
      applyOverlayVisibility();
    }
  });

  const pos = game.settings.get('partywatch', 'overlayPosition').split(',');
  overlay.style.top = `${pos[0]}vh`;
  overlay.style.left = `${pos[1]}vh`;

  updateOverlayLayout();
  updateOverlayScale();
  updateOverlayBackground();
  refreshPartyWatch();
}

async function refreshPartyWatch() {
  
  console.log("PartyWatch | Refreshing overlay...");
  const container = document.getElementById('partywatch-overlay');
  if (!container) return console.warn("PartyWatch | No container found.");
  const showPortraits = game.settings.get('partywatch', 'showPortraits');
  const layout = game.settings.get('partywatch', 'overlayLayout') || 'flex';
  container.style.display = layout;

  container.querySelectorAll('.partywatch-entry, .partywatch-group, .partywatch-empty-info').forEach(e => e.remove());

  const showOffline = game.settings.get("partywatch", "showOffline");
  const showHealthDetails = game.settings.get('partywatch', 'showHealthDetails');
  const healthDisplayMode = game.settings.get('partywatch', 'healthDisplayMode') || 'numbers';
  const portraitSource = game.settings.get('partywatch', 'portraitSource') || 'actor';
  const tintPortrait = game.settings.get('partywatch', 'tintPortrait');
  const tintMode = game.settings.get('partywatch', 'tintMode') || 'none';
  const onlyInScene = game.settings.get('partywatch', 'onlyInScene') ?? false;

  const sceneActorIds = onlyInScene && canvas?.scene
    ? new Set(canvas.scene.tokens.map(t => t.actorId).filter(Boolean))
    : null;

  const players = game.users.players.filter(u => {
    if (!u.character) return false;
    if (!u.active && !showOffline) return false;
    if (onlyInScene) {
      if (!sceneActorIds || !sceneActorIds.has(u.character.id)) return false;
    }
    return true;
  });

  // Wipe previous groups (and any stray entries from older renders).
  container.querySelectorAll('.partywatch-group').forEach(e => e.remove());

  const barPosition = game.settings.get('partywatch', 'barPosition') || 'below';
  const barOnPortrait = barPosition === 'overlay' && showPortraits;
  const companionType = (game.settings.get('partywatch', 'companionActorType') || '').trim();

  // Builds one .partywatch-entry element for the given actor.
  function buildEntry(actor, { isCompanion = false } = {}) {
    const { hp: currentHp, max: maxHp, temp: tempHp, tempMax: tempMaxHp } = getActorHp(actor);
    const effectiveMax = (maxHp || 0) + (tempMaxHp || 0);

    if (!partywatchLastHp.has(actor.id) && typeof currentHp === 'number') {
      partywatchLastHp.set(actor.id, currentHp);
    }

    let barPercent = effectiveMax > 0
      ? Math.clamped(Math.floor((currentHp / effectiveMax) * 100), 0, 100)
      : 0;
    if (game.settings.get('partywatch', 'wounds')) barPercent = 100 - barPercent;
    const tempPercent = effectiveMax > 0
      ? Math.clamped(Math.floor((tempHp / effectiveMax) * 100), 0, 100)
      : 0;
    const hpPercent = Math.clamped(Math.floor((currentHp / (maxHp || 1)) * 100), 0, 100);
    const imgSrc = portraitSource === 'token'
      ? (actor.prototypeToken?.texture?.src || actor.img)
      : actor.img;

    let healthText = '';
    if (showHealthDetails && !isCompanion) {
      if (healthDisplayMode === 'numbers') {
        const totalMax = (maxHp || 0) + (tempMaxHp || 0);
        healthText = `${currentHp}/${totalMax}`;
        if (tempHp > 0) healthText += ` <span class="partywatch-temp-suffix">+${tempHp}</span>`;
      } else if (healthDisplayMode === 'estimate') {
        healthText = getHealthEstimate(hpPercent);
        if (tempHp > 0) healthText += ` <span class="partywatch-temp-suffix">+${tempHp}</span>`;
      }
    }

    const barRowHTML = `
      <div class="partywatch-bar-row">
        ${healthText ? `<div class="partywatch-hp-text">${healthText}</div>` : ''}
        <div class="partywatch-bar" style="background-color: ${partywatchDarkenColor(getHPBarColor(barPercent), 0.22)};">
          <div class="partywatch-bar-damage" style="width: ${barPercent}%;"></div>
          <div class="partywatch-bar-inner" style="width: ${barPercent}%; background: ${getHPBarColor(barPercent)};"></div>
          ${tempPercent > 0 ? `<div class="partywatch-bar-temp" style="left: 0; width: ${tempPercent}%;"></div>` : ''}
        </div>
      </div>
    `;

    const extraAttrsHTML = isCompanion ? '' : buildExtraAttributesHTML(actor);

    const entryEl = document.createElement('div');
    entryEl.className = 'partywatch-entry'
      + (barOnPortrait ? ' partywatch-bar-on-portrait' : '')
      + (isCompanion ? ' partywatch-companion' : '');
    entryEl.dataset.actorId = actor.id;
    entryEl.dataset.name = actor.name;
    entryEl.innerHTML = `
      ${showPortraits ? `
        <div class="partywatch-img-wrapper">
          ${generateOverlay(hpPercent, tintMode)}
          <img src="${imgSrc}" alt="${actor.name}" class="partywatch-img">
          ${barOnPortrait ? barRowHTML : ''}
        </div>
      ` : ''}
      ${!barOnPortrait ? barRowHTML : ''}
      ${extraAttrsHTML}
      ${game.settings.get('partywatch', 'nameDisplay') && !isCompanion ? `<div class="partywatch-name">${actor.name}</div>` : ''}
    `;
    entryEl.addEventListener('click', event => {
      if (event.button === 0) {
        const token = canvas.tokens.placeables.find(t => t.actor && t.actor.id === actor.id);
        if (token) {
          canvas.animatePan({ x: token.x + token.w / 2, y: token.y + token.h / 2, scale: canvas.stage.scale.x });
          if (game.user.isGM) token.control({ releaseOthers: true });
        }
      }
    });
    entryEl.addEventListener('contextmenu', event => {
      event.preventDefault();
      if (game.user.isGM || actor.isOwner) actor.sheet.render(true);
    });
    return entryEl;
  }

  // Find on-scene companions (actors of the configured companion type that
  // the given player owns) — dedupe by actor id since one actor can have
  // multiple tokens on a scene.
  function findCompanionsForPlayer(player) {
    if (!companionType) return [];
    if (!canvas?.scene) return [];
    const out = [];
    const seen = new Set();
    for (const tokenDoc of canvas.scene.tokens) {
      const compActor = tokenDoc.actor;
      if (!compActor) continue;
      if (compActor.id === player.character?.id) continue;
      if (seen.has(compActor.id)) continue;
      if (compActor.type !== companionType) continue;
      if (!compActor.testUserPermission(player, 'OWNER')) continue;
      seen.add(compActor.id);
      out.push(compActor);
    }
    return out;
  }

  for (const player of players) {
    const actor = player.character;
    if (!actor) continue;

    const group = document.createElement('div');
    group.className = 'partywatch-group';
    group.appendChild(buildEntry(actor));

    const companions = findCompanionsForPlayer(player);
    if (companions.length) {
      const compContainer = document.createElement('div');
      compContainer.className = 'partywatch-companions';
      for (const compActor of companions) {
        compContainer.appendChild(buildEntry(compActor, { isCompanion: true }));
      }
      group.appendChild(compContainer);
    }

    container.appendChild(group);
  }
  if (container.querySelectorAll('.partywatch-entry').length === 0) {
    container.querySelectorAll('.partywatch-group, .partywatch-empty-info').forEach(e => e.remove());
    const emptyInfo = document.createElement('div');
    emptyInfo.className = 'partywatch-empty-info';
    emptyInfo.innerHTML = `
      <div style="text-align: center; padding: 5px; color: #aaa; font-size: 0.6em;">
        <div style="font-weight: bold; margin-bottom: 2px;">PartyWatch</div>
        <i class="fas fa-users-slash" title="PartyWatch: No active characters found. Assign characters to players to display them here." style="font-size: 1.5em; color: #888;"></i>
      </div>
    `;
    container.appendChild(emptyInfo);
  }
}


function getHPPercent(actor) {
  const hp = partywatchGetProperty(actor.system, "attributes.hp.value") ?? partywatchGetProperty(actor.system, "wounds.value") ?? 0;
  const maxHp = partywatchGetProperty(actor.system, "attributes.hp.max") ?? partywatchGetProperty(actor.system, "wounds.max") ?? 1;
  if (!maxHp || maxHp <= 0) return 0;
  return Math.clamped(Math.floor((hp / maxHp) * 100), 0, 100);
}

Math.clamped = (value, min, max) => Math.min(Math.max(value, min), max);

function dragElement(elmnt, dragHandle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  dragHandle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

    // Position speichern
    const vhTop = (elmnt.offsetTop / window.innerHeight) * 100;
    const vhLeft = (elmnt.offsetLeft / window.innerHeight) * 100;
    game.settings.set('partywatch', 'overlayPosition', `${vhTop.toFixed(2)},${vhLeft.toFixed(2)}`);
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
function getHPBarColor(percent) {
  const scheme = game.settings.get('partywatch', 'hpColorScheme');
  if (scheme === 'static') return '#00aa00';
  if (scheme === 'staticRed') return '#c2241a';
  if (percent <= 25) return '#aa0000'; // rot
  if (percent <= 50) return '#ffaa00'; // orange
  if (percent <= 75) return '#aaaa00'; // gelb
  return '#00aa00'; // grün
}

function partywatchDarkenColor(color, factor = 0.22) {
  // Accepts #rgb, #rrggbb, or rgb(r,g,b); returns rgb() string at `factor` brightness.
  let r = 0, g = 0, b = 0;
  if (typeof color !== 'string') return `rgb(0,0,0)`;
  const hex = color.trim().replace(/^#/, '');
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    const m = color.match(/\d+/g);
    if (m && m.length >= 3) { r = +m[0]; g = +m[1]; b = +m[2]; }
  }
  const f = Math.max(0, Math.min(1, factor));
  return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;
}

/* ===== EXTRA ATTRIBUTES =================================================
   User-defined extra attribute readouts (AC, Passive Perception, mana, etc).
   Shown as a row of compact badges/bars under each main entry.
   ====================================================================== */
function partywatchGetAttributes() {
  const raw = game.settings.get('partywatch', 'extraAttributes');
  if (!raw) return [];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) || []; } catch (e) { return []; }
  }
  return Array.isArray(raw) ? raw : [];
}

function buildExtraAttributesHTML(actor) {
  if (!game.settings.get('partywatch', 'enableExtraAttributes')) return '';
  if (game.settings.get('partywatch', 'extraAttributesGMOnly') && !game.user.isGM) return '';
  const attrs = partywatchGetAttributes();
  if (!attrs.length) return '';

  const parts = [];
  for (const a of attrs) {
    if (!a || !a.currentPath) continue;
    const value = partywatchGetProperty(actor, a.currentPath);
    if (value === undefined || value === null) continue;
    const max = a.maxPath ? partywatchGetProperty(actor, a.maxPath) : null;
    const color = a.color || '#cbd5e1';
    const label = a.label || '';
    const iconHTML = a.icon ? `<i class="fas fa-${a.icon}"></i>` : '';
    const valueStr = max != null ? `${value}/${max}` : String(value);

    if (a.type === 'bar' && max != null && max > 0) {
      const pct = Math.max(0, Math.min(100, (Number(value) / Number(max)) * 100));
      parts.push(`
        <div class="partywatch-attr partywatch-attr-bar" title="${label}: ${valueStr}" style="--attr-color: ${color}; --attr-bg: ${partywatchDarkenColor(color, 0.22)};">
          ${iconHTML ? `<span class="partywatch-attr-icon">${iconHTML}</span>` : ''}
          <div class="partywatch-attr-bartrack"><div class="partywatch-attr-barfill" style="width: ${pct}%;"></div></div>
        </div>`);
    } else if (a.type === 'number') {
      parts.push(`
        <div class="partywatch-attr partywatch-attr-number" title="${label}: ${valueStr}" style="--attr-color: ${color};">
          ${iconHTML}<span class="partywatch-attr-value">${valueStr}</span>
        </div>`);
    } else {
      // default: 'badge' — icon pill + number
      parts.push(`
        <div class="partywatch-attr partywatch-attr-badge" title="${label}: ${valueStr}" style="--attr-color: ${color};">
          ${iconHTML}<span class="partywatch-attr-value">${valueStr}</span>
        </div>`);
    }
  }
  if (!parts.length) return '';
  return `<div class="partywatch-attrs">${parts.join('')}</div>`;
}

function updateOverlayPosition() {
  const container = document.getElementById('partywatch-overlay');
  if (!container) return;
  const pos = game.settings.get('partywatch', 'overlayPosition').split(',');
  container.style.top = `${pos[0]}vh`;
  container.style.left = `${pos[1]}vh`;
}

function updateOverlayLayout() {
  const container = document.getElementById('partywatch-overlay');
  if (!container) return;
  const layout = game.settings.get('partywatch', 'overlayLayout');
  container.style.display = layout;
}

function updateOverlayScale() {
  const container = document.getElementById('partywatch-overlay');
  if (!container) return;
  const scale = game.settings.get('partywatch', 'scale');
  container.style.transform = `scale(${scale})`;
}
function updateOverlayBackground() {
  const container = document.getElementById('partywatch-overlay');
  if (!container) return;
  const opacity = game.settings.get('partywatch', 'backgroundOpacity') ?? 0.5;
  const color = game.settings.get('partywatch', 'backgroundColor') ?? '#000000';
  const bg = hexToRgba(color, opacity);
  container.style.background = bg;
  // Publish the same bg via a CSS variable so satellite panels (companions)
  // can mirror it without JS having to re-apply each one.
  container.style.setProperty('--partywatch-bg', bg);
}
function hexToRgba(hex, alpha) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function getHealthEstimate(percent) {
  if (percent === 100) return "Uninjured";
  if (percent >= 75) return "Barely Injured";
  if (percent >= 50) return "Injured";
  if (percent >= 25) return "Badly Injured";
  if (percent > 0) return "Near Death";
  if (percent === 0) return "Unconscious";
  return "";
}
function generateOverlay(hpPercent, tintMode) {
  if (tintMode === 'none' || hpPercent >= 95) return '';

  let color = '';
  let opacity = 0.4; // Standard halbtransparent

  if (tintMode === 'color') {
    if (hpPercent <= 25) color = '#ff0000'; // rot
    else if (hpPercent <= 50) color = '#ffaa00'; // orange
    else if (hpPercent <= 75) color = '#ffff00'; // gelb
    else color = '#00ff00'; // grün
  } else if (tintMode === 'darken') {
    color = '#000000';
    const normalized = Math.clamped((90 - hpPercent) / 90, 0, 1);
    opacity = Math.max(0.2, normalized ** 2);
  }

  return `<div class="partywatch-img-overlay" style="background: ${color}; opacity: ${opacity};"></div>`;
}

function getBarPercent(actor) {
  const { hp, max, tempMax } = getActorHp(actor);
  const effectiveMax = (max || 0) + (tempMax || 0);
  if (typeof hp !== 'number' || effectiveMax <= 0) return 0;

  let percent = Math.clamped(Math.floor((hp / effectiveMax) * 100), 0, 100);
  if (game.settings.get('partywatch', 'wounds')) percent = 100 - percent;
  return percent;
}


function getActorHp(actor) {
  const hp = partywatchGetProperty(actor, game.settings.get('partywatch', 'hpPath')) ?? 0;
  const max = partywatchGetProperty(actor, game.settings.get('partywatch', 'maxhpPath')) ?? 1;
  const tempPath = game.settings.get('partywatch', 'tempHpPath');
  const tempMaxPath = game.settings.get('partywatch', 'tempMaxHpPath');
  const temp = tempPath ? (Number(partywatchGetProperty(actor, tempPath)) || 0) : 0;
  const tempMax = tempMaxPath ? (Number(partywatchGetProperty(actor, tempMaxPath)) || 0) : 0;
  return { hp, max, temp, tempMax };
}

//SETUP
Hooks.once('ready', async function() {
  if (!game.user.isGM) return;
  if (game.system.id === "dnd5e") return;
  if (game.settings.get('partywatch', 'hasSeenRecommendation')) return;
  
  await partywatchSetup();
});

async function partywatchSetup() {
  if (game.system.id === "dnd5e") return;
  if (game.settings.get('partywatch', 'hasSeenRecommendation')) return;

  const currentSystem = game.system.id;
  const systemPresets = await loadSystemPresets();
  const preset = systemPresets[currentSystem];
  if (!preset) return;

  const settingsToApply = [];
  const hpPath = game.settings.get('partywatch', 'hpPath') ?? '—';
  const maxHpPath = game.settings.get('partywatch', 'maxhpPath') ?? '—';

  if (preset.settings) {
    for (const [key, value] of Object.entries(preset.settings)) {
      const [namespace, settingKey] = key.split('.');
      const fullKey = `${namespace}.${settingKey}`;
      if (!game.settings.settings.has(fullKey)) continue;
      const current = game.settings.get(namespace, settingKey);
      if (current !== value) {
        settingsToApply.push({ namespace, settingKey, current, value });
      }
    }
  }

  const content = `
  <style>
    #partywatch-setup {
      font-family: var(--font-primary);
    }
    #partywatch-setup h1 {
      background: #333;
      color: white;
      text-align: center;
      font-weight: bold;
      font-size: 2em;
      padding: 10px 0;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    #partywatch-setup p, #partywatch-setup li {
      margin: 0.2em 0;
    }
    #partywatch-setup .old {
      color: #999;
      text-decoration: line-through;
    }
    #partywatch-setup .new {
      color: white;
      font-weight: bold;
    }
    #partywatch-setup h3 {
      margin-top: 1em;
      color: var(--color-text-light-heading);
    }
    #partywatch-setup ul {
      margin: 0.4em 0;
      padding-left: 1.2em;
    }
  </style>
  <div id="partywatch-setup">
    <h1>PartyWatch</h1>
    <p>The detected system (<strong>${preset.name}</strong>) has recommended settings.</p>
    <p>Would you like to apply them?</p>
    <hr>
    <p><strong>HP Path:</strong><br><span class="old">${hpPath}</span> → <span class="new">${preset.hpPath}</span></p>
    <p><strong>Max HP Path:</strong><br><span class="old">${maxHpPath}</span> → <span class="new">${preset.maxHpPath}</span></p>
    ${settingsToApply.length ? `
      <h3>Other Settings to Change:</h3>
      <ul>
        ${settingsToApply.map(s => `
          <li><strong>${s.namespace}.${s.settingKey}</strong>: <span class="old">${s.current ?? '—'}</span> → <span class="new">${s.value}</span></li>
        `).join("")}
      </ul>
    ` : ""}
  </div>
  `;

  new Dialog({
    title: "PartyWatch Setup",
    content,
    buttons: {
      yes: {
        label: "Apply Settings",
        callback: async () => {
          await game.settings.set('partywatch', 'hpPath', preset.hpPath);
          await game.settings.set('partywatch', 'maxhpPath', preset.maxHpPath);
          for (const s of settingsToApply) {
            await game.settings.set(s.namespace, s.settingKey, s.value);
          }
          await game.settings.set('partywatch', 'hasSeenRecommendation', true);
          ui.notifications.info(`PartyWatch | Settings applied for ${preset.name}.`);
          window.location.reload();
        }
      },
      no: {
        label: "Don't ask again",
        callback: async () => {
          await game.settings.set('partywatch', 'hasSeenRecommendation', true);
          ui.notifications.warn("PartyWatch | Setup skipped.");
        }
      }
    },
    default: "yes"
  }).render(true);
}

async function loadSystemPresets() {
  const githubURL = "https://raw.githubusercontent.com/Handyfon/heartbeat/master/systemSettings.json";
  
  try {
      const response = await fetch(githubURL, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const json = await response.json();
      console.log("Partywatch | Loaded system presets from GitHub.");
  console.log(json);
      return json;
  } catch (error) {
      console.warn("Partywatch | Failed to load system presets from GitHub. Defaulting to unsupported system behavior.", error);
      return {}; // No fallback, just return empty object
  }
}
