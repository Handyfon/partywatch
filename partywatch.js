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
  
  game.settings.register('partywatch', 'hpColorScheme', {
    name: 'HP Bar Color Scheme',
    hint: 'Change HP bar color dynamically.',
    scope: 'client',
    config: true,
    choices: {
      'static': 'Static Green',
      'dynamic': 'Dynamic (Green/Yellow/Red)'
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
    onChange: visible => {
      const overlay = document.getElementById('partywatch-overlay');
      if (overlay) overlay.style.display = visible ? '' : 'none';
    }
  });  
  
});

Hooks.once('ready', () => {
  console.log("PartyWatch | Initializing...");

  if (!game.user.isGM && !game.settings.get('partywatch', 'showForPlayers')) return;

  createPartywatchOverlay();
  refreshPartyWatch();

  Hooks.on('updateActor', refreshPartyWatch);
  Hooks.on('controlToken', refreshPartyWatch);
  Hooks.on('renderPlayerList', refreshPartyWatch);
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
          overlay.style.display = '';
          refreshPartyWatch(); // <- neu aufbauen
        } else {
          overlay.style.display = 'none';
        }
      }
    };
  }
});


Hooks.on('updateActor', (actor, data, options, userId) => {
  handleActorUpdate(actor, data);
});
async function handleActorUpdate(actor, data) {
  if (!actor.isOwner) return;

  const { hp: currentHp } = getActorHp(actor);
  const previousHp = actor.getFlag('partywatch', 'lastHp') ?? currentHp;
  await actor.setFlag('partywatch', 'lastHp', currentHp);

  const deltaHp = currentHp - previousHp;

  if (deltaHp < 0) {
    const container = document.getElementById('partywatch-overlay');
    if (!container) return;

    const entry = Array.from(container.querySelectorAll('.partywatch-entry')).find(e => {
      const name = e.querySelector('.partywatch-name')?.textContent;
      return name === actor.name;
    });

    if (!entry) return;

    const img = entry.querySelector('.partywatch-img');
    if (!img) return;

    img.classList.add('partywatch-damage-shake');
    setTimeout(() => img.classList.remove('partywatch-damage-shake'), 500);
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

  const visible = game.settings.get('partywatch', 'overlayVisible');
  overlay.style.display = visible ? '' : 'none';

  document.getElementById('partywatch-cog').addEventListener('click', async () => {
    const initialSettings = {
      overlayLayout: game.settings.get('partywatch', 'overlayLayout'),
      nameDisplay: game.settings.get('partywatch', 'nameDisplay'),
      scale: game.settings.get('partywatch', 'scale'),
      hpColorScheme: game.settings.get('partywatch', 'hpColorScheme'),
      backgroundOpacity: game.settings.get('partywatch', 'backgroundOpacity') ?? 0.5
    };
  
    let confirmed = false; // Neu: merken ob gespeichert wurde
  
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
          <label>Show Names:</label>
          <input type="checkbox" id="pw-nameDisplay" ${initialSettings.nameDisplay ? 'checked' : ''}>
        </div>
        <div>
          <label>Show Portraits:</label>
          <input type="checkbox" id="pw-showPortraits" ${game.settings.get('partywatch', 'showPortraits') ? 'checked' : ''}>
        </div>
        <div>
          <label>Scale:</label>
          <input type="range" id="pw-scale" min="0.5" max="2" step="0.1" value="${initialSettings.scale}">
        </div>
        <div>
          <label>HP Bar Color:</label>
          <select id="pw-hpColor">
            <option value="static" ${initialSettings.hpColorScheme === 'static' ? 'selected' : ''}>Static Green</option>
            <option value="dynamic" ${initialSettings.hpColorScheme === 'dynamic' ? 'selected' : ''}>Dynamic (Green/Yellow/Red)</option>
          </select>
        </div>
        <div>
          <label>Background Transparency:</label>
          <input type="range" id="pw-background" min="0" max="1" step="0.05" value="${initialSettings.backgroundOpacity}">
        </div>
        <div>
          <label>Background Color:</label>
          <input type="color" id="pw-backgroundColor" value="${game.settings.get('partywatch', 'backgroundColor')}">
        </div>
        <div>
          <label>Portrait Tint Mode:</label>
          <select id="pw-tintMode">
            <option value="none" ${game.settings.get('partywatch', 'tintMode') === 'none' ? 'selected' : ''}>No Tint</option>
            <option value="darken" ${game.settings.get('partywatch', 'tintMode') === 'darken' ? 'selected' : ''}>Darken on Low Health</option>
            <option value="color" ${game.settings.get('partywatch', 'tintMode') === 'color' ? 'selected' : ''}>Colorize by Health</option>
          </select>
        </div>
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
    });
  
    dialog.render(true);
  
    Hooks.once("renderDialog", (app, html) => {
      html.find('#pw-layout').on('change', e => {
        game.settings.set('partywatch', 'overlayLayout', e.target.value);
        updateOverlayLayout();
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
      html.find('#pw-tintPortrait').on('change', e => {
        game.settings.set('partywatch', 'tintPortrait', e.target.checked);
        refreshPartyWatch();
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
    });
  
    async function resetSettings() {
      await game.settings.set('partywatch', 'overlayLayout', initialSettings.overlayLayout);
      await game.settings.set('partywatch', 'nameDisplay', initialSettings.nameDisplay);
      await game.settings.set('partywatch', 'scale', initialSettings.scale);
      await game.settings.set('partywatch', 'hpColorScheme', initialSettings.hpColorScheme);
      await game.settings.set('partywatch', 'backgroundOpacity', initialSettings.backgroundOpacity);
      refreshPartyWatch();
      updateOverlayLayout();
      updateOverlayScale();
      updateOverlayBackground();
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

  container.querySelectorAll('.partywatch-entry').forEach(e => e.remove());

  const showOffline = game.settings.get("partywatch", "showOffline");
  const showHealthDetails = game.settings.get('partywatch', 'showHealthDetails');
  const healthDisplayMode = game.settings.get('partywatch', 'healthDisplayMode') || 'numbers';
  const portraitSource = game.settings.get('partywatch', 'portraitSource') || 'actor';
  const tintPortrait = game.settings.get('partywatch', 'tintPortrait');
  const tintMode = game.settings.get('partywatch', 'tintMode') || 'none';
  const players = game.users.players.filter(u => (u.active || showOffline) && u.character);

  for (const player of players) {
    const actor = player.character;
    if (!actor) continue;

    const barPercent = getBarPercent(actor);
    const { hp: currentHp, max: maxHp } = getActorHp(actor);
    
    const hpPercent = Math.clamped(Math.floor((currentHp / (maxHp || 1)) * 100), 0, 100);
    const imgSrc = portraitSource === 'token' 
    ? (actor.prototypeToken.texture?.src || actor.img) 
    : actor.img;
  
    let tintStyle = '';
    if (tintMode === 'darken') {
      if (hpPercent >= 70) {
        tintStyle = ''; // 90–100% HP → kein Filter
      } else {
        const normalized = Math.clamped((90 - hpPercent) / 90, 0, 1); // erst ab <90% starten
        const brightness = Math.max(0.2, 1 - (normalized ** 2)); // quadratische Kurve: langsamer Start, schneller Abfall
        tintStyle = `style="filter: brightness(${brightness.toFixed(2)}); transition: filter 0.3s;"`;
      }
    }
    else if (tintMode === 'color') {
      if (hpPercent >= 95) {
        tintStyle = ''; // 95–100% HP → kein Filter
      } else {
        let hue = 200; // Start Grün
        if (hpPercent <= 25) hue = -10;      // Rot
        else if (hpPercent <= 50) hue = 30; // Orange
        else if (hpPercent <= 75) hue = 60; // Gelb
    
        tintStyle = `style="filter: sepia(1) saturate(5) hue-rotate(${hue}deg); transition: filter 0.3s;"`;
      }
    }
    
    
    let healthText = '';
    if (showHealthDetails) {
      if (healthDisplayMode === 'numbers') {
        healthText = `${currentHp}/${maxHp}`;
      } else if (healthDisplayMode === 'estimate') {
        healthText = getHealthEstimate(hpPercent);
      }
    }

    const entry = document.createElement('div');
    entry.className = 'partywatch-entry';
    entry.innerHTML = `

      ${showPortraits ? `
        <div class="partywatch-img-wrapper">
          ${generateOverlay(hpPercent, tintMode)}
          <img src="${imgSrc}" alt="${actor.name}" class="partywatch-img">
        </div>
      ` : ''}
      <div class="partywatch-bar">
        <div class="partywatch-bar-inner" style="width: ${barPercent}%; background: ${getHPBarColor(barPercent)};"></div>
        ${healthText ? `<div class="partywatch-hp-text">${healthText}</div>` : ''}
      </div>
      ${game.settings.get('partywatch', 'nameDisplay') ? `<div class="partywatch-name">${actor.name}</div>` : ''}
    `;
    entry.addEventListener('click', event => {
      if (event.button === 0) { // Linksklick
        const token = canvas.tokens.placeables.find(t => t.actor && t.actor.id === actor.id);
        if (token) {
          canvas.animatePan({ 
            x: token.x + token.w / 2, 
            y: token.y + token.h / 2, 
            scale: canvas.stage.scale.x // keine Zoomänderung
          });
          if(user.isGM)
            token.control({ releaseOthers: true });
        }
      }
    });
    entry.addEventListener('contextmenu', event => { // Rechtsklick
      event.preventDefault();
      if (game.user.isGM || actor.isOwner) {
        actor.sheet.render(true);
      }
    });
    container.appendChild(entry);
  }
  if (container.querySelectorAll('.partywatch-entry').length === 0) {
    container.querySelectorAll('.partywatch-entry, .partywatch-empty-info').forEach(e => e.remove());
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
  const hp = getProperty(actor.system, "attributes.hp.value") ?? getProperty(actor.system, "wounds.value") ?? 0;
  const maxHp = getProperty(actor.system, "attributes.hp.max") ?? getProperty(actor.system, "wounds.max") ?? 1;
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
  if (percent <= 25) return '#aa0000'; // rot
  if (percent <= 50) return '#ffaa00'; // orange
  if (percent <= 75) return '#aaaa00'; // gelb
  return '#00aa00'; // grün
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
  container.style.background = hexToRgba(color, opacity);
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
  const { hp, max } = getActorHp(actor);
  if (typeof hp !== 'number' || typeof max !== 'number' || max <= 0) return 0;

  let percent = Math.clamped(Math.floor((hp / max) * 100), 0, 100);
  if (game.settings.get('partywatch', 'wounds')) percent = 100 - percent;
  return percent;
}


function getActorHp(actor) {
  const hp = getProperty(actor, game.settings.get('partywatch', 'hpPath')) ?? 0;
  const max = getProperty(actor, game.settings.get('partywatch', 'maxhpPath')) ?? 1;
  return { hp, max };
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
