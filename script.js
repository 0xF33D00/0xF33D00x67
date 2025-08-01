// --- Make title clickable to return to index ---
window.addEventListener('DOMContentLoaded', function() {
  const title = document.querySelector('h1, .main-title, h2');
  if (title && title.textContent && title.textContent.trim().toLowerCase().includes('awesome media collection')) {
    // Wrap the title in a link if not already
    if (!title.querySelector('a')) {
      const link = document.createElement('a');
      link.href = 'index.html';
      link.textContent = title.textContent;
      link.style.color = '#fff';
      link.style.textDecoration = 'none';
      link.style.transition = 'color 0.18s';
      link.onmouseover = function() { this.style.color = '#ffd700'; };
      link.onmouseout = function() { this.style.color = '#fff'; };
      title.textContent = '';
      title.appendChild(link);
      title.style.cursor = 'pointer';
    }
  }
});
// --- Modal for card details ---
function showDetails(item) {
  // Remove any existing modal
  let oldModal = document.getElementById('detailsModal');
  if (oldModal) oldModal.remove();
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'detailsModal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.7)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';
  // Modal content
  let media = '';
  if (item.videoSrc) {
    media = `<iframe src="${item.videoSrc}" frameborder="0" allowfullscreen style="width:100%;max-width:700px;height:400px;display:block;margin:0 auto 1.5em auto;border-radius:12px;"></iframe>`;
  } else if (item.type === "image") {
    media = `<img src="${item.src}" alt="${item.title}" style="width:100%;max-width:700px;display:block;margin:0 auto 1.5em auto;">`;
  } else if (item.type === "video") {
    // If src is a YouTube link, auto-embed
    if (item.src && (item.src.includes('youtube.com/watch') || item.src.includes('youtu.be/'))) {
      // Extract video ID
      let vid = '';
      let m = item.src.match(/[?&]v=([\w-]+)/);
      if (m) vid = m[1];
      else {
        m = item.src.match(/youtu\.be\/([\w-]+)/);
        if (m) vid = m[1];
      }
      if (vid) {
        media = `<iframe src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen style="width:100%;max-width:700px;height:400px;display:block;margin:0 auto 1.5em auto;border-radius:12px;"></iframe>`;
      } else {
        media = `<video src="${item.src}" controls style="width:100%;max-width:700px;display:block;margin:0 auto 1.5em auto;border-radius:12px;"></video>`;
      }
    } else if (item.src && item.src.includes('youtube.com/embed')) {
      media = `<iframe src="${item.src}" frameborder="0" allowfullscreen style="width:100%;max-width:700px;height:400px;display:block;margin:0 auto 1.5em auto;border-radius:12px;"></iframe>`;
    } else {
      media = `<video src="${item.src}" controls style="width:100%;max-width:700px;display:block;margin:0 auto 1.5em auto;border-radius:12px;"></video>`;
    }
  }
  let tagHtml = '';
  if (item.tags && item.tags.length) {
    tagHtml = `<div style='margin:0.5em 0;display:flex;flex-wrap:wrap;gap:0.4em;justify-content:center;'>` + item.tags.map(t => `<span class='tag'>${t}</span>`).join(' ') + `</div>`;
  }
  let attrHtml = '';
  if (item.attributes && item.attributes.length) {
    attrHtml = `<div style='margin:0.5em 0;display:flex;flex-wrap:wrap;gap:0.4em;justify-content:center;'>` + item.attributes.map(a => {
      let extra = '';
      let style = '';
      if (a && a.toString().toLowerCase() === 'verified') extra = ' ✅';
      if (a && a.toString().toLowerCase() === 'gabz') extra = ` <img src="src/icons/gabz.png" alt="Gabz" style="height:1.1em;width:1.1em;vertical-align:middle;margin-left:2px;">`;
      if (a && a.toString().toLowerCase() === 'for review') { extra = ' ⏳'; style = 'color:#e74c3c;font-weight:bold;'; }
      return `<span class='tag tag-attr'${style ? ` style="${style}"` : ''}>${a}${extra}</span>`;
    }).join(' ') + `</div>`;
  }
  let mapCreatorHtml = '';
  if (item.category && item.category.toLowerCase() === 'maps' && item.mapCreator) {
    let mcIcon = '';
    if (item.mapCreator.toString().toLowerCase() === 'gabz') {
      mcIcon = ` <img src="src/icons/gabz.png" alt="Gabz" style="height:1.1em;width:1.1em;vertical-align:middle;margin-left:2px;">`;
    }
    mapCreatorHtml = `<div style='margin:0.5em 0;display:flex;justify-content:center;'><span class='tag tag-mapcreator'>${item.mapCreator} (c)${mcIcon}</span></div>`;
  }
  let infoHtml = '';
  if (item.info) {
    // Convert Markdown links to HTML <a> tags
    let info = item.info
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n|<br\s*\/\?\s*>/gi, '<br>');
    infoHtml = `<div style='margin:1em 0;text-align:center;'>${info}</div>`;
  }
  // Location (for maps)
  let locationHtml = '';
  if (item.category && item.category.toLowerCase() === 'maps' && item.location) {
    // Extract just the coordinates if in vec3(...) format
    let coords = item.location;
    const match = coords.match(/^vec3\(([^)]+)\)$/i);
    if (match) coords = match[1];
    locationHtml = `<div style=\"margin:0.7em 0 0.7em 0;width:100%;display:block;\"><span style=\"display:inline-block;background:#181920;padding:0.25em 0.7em;border-radius:6px;color:#fff;font-family:monospace;font-size:1.08em;user-select:all;margin-left:0;\">${coords}</span></div>`;
  }
  // Compose tags in a single line
  let allTagsLine = '';
  if ((item.tags && item.tags.length) || (item.category && item.category.toLowerCase() === 'maps' && item.mapCreator)) {
    let tagList = [];
    if (item.tags && item.tags.length) tagList = tagList.concat(item.tags);
    if (item.category && item.category.toLowerCase() === 'maps' && item.mapCreator) tagList.push(item.mapCreator);
    allTagsLine = tagList.map(t => `<span class='tag'>${t.toUpperCase()}</span>`).join(' ');
  }
  // Compose attributes in a single line
  let allAttrsLine = '';
  if (item.attributes && item.attributes.length) {
    allAttrsLine = item.attributes.map(a => `<span class='tag tag-attr'>${a.toUpperCase()}</span>`).join(' ');
  }
  modal.innerHTML = `
    <div style="background:#23242a;padding:2em 2.5em;border-radius:16px;max-width:800px;width:95vw;max-height:90vh;overflow:auto;position:relative;box-shadow:0 8px 32px #000a;">
      <div style="position:absolute;top:1em;right:1em;z-index:1001;">
        <button id="closeModalBtn" style="font-size:1.7em;background:none;border:none;color:#fff;cursor:pointer;z-index:1002;">&times;</button>
      </div>
      <h2 style="margin-top:0;text-align:center;">${item.title}</h2>
      <div style="display:flex;flex-direction:column;align-items:center;">
        ${media}
        <div style="margin:1em 0 0.5em 0;width:100%;text-align:left;display:flex;flex-wrap:wrap;align-items:center;gap:0.5em;justify-content:space-between;">
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5em;">
            ${allTagsLine}
            ${allAttrsLine}
          </div>
          ${item.label ? `<span class='card-label ${item.labelType === 'paid' ? 'label-paid' : 'label-free'}' style='font-size:1em;vertical-align:middle;box-shadow:0 2px 8px #0005;padding:0.2em 1.1em;position:static;border-radius:0;'>${item.label}</span>` : ''}
        </div>
        ${item.download ? `<div style='width:100%;text-align:right;margin:0.2em 0 0.7em 0;'><a href='${item.download}' download style='display:inline-block;background:#6c63ff;color:#fff;font-weight:600;padding:0.5em 1.3em;border-radius:8px;text-decoration:none;box-shadow:0 2px 8px #0005;transition:background 0.18s;'><img src="src/icons/download_icon.png" alt="Download" style="height:1.3em;width:1.3em;vertical-align:middle;filter:invert(1);"></a></div>` : ''}
        <div style="margin:0 0 0.5em 0;width:100%;">
          <span style="display:block;color:#e0e0e0;">
            ${(infoHtml || '').replace('<div ', '<div style=\'color:#e0e0e0;\' ').replace(/<a /g, '<a style=\'color:#6c63ff;text-decoration:underline;\' ')}
          </span>
        </div>
        ${locationHtml}
        <div style="margin:0 0 0.5em 0;width:100%;text-align:left;">
          ${item.description || ''}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('closeModalBtn').onclick = () => modal.remove();
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  // Remove border-radius from coordinates span when clicked, restore after delay
  if (item.category && item.category.toLowerCase() === 'maps' && item.location) {
    setTimeout(() => {
      const locSpan = document.querySelector('#detailsModal span[style*="background:#181920"]');
      if (locSpan) {
        locSpan.style.cursor = 'pointer';
        locSpan.onclick = function() {
          const prevRadius = locSpan.style.borderRadius;
          locSpan.style.borderRadius = '0';
          setTimeout(() => { locSpan.style.borderRadius = prevRadius; }, 900);
        };
      }
    }, 0);
  }
}

let items = [];
let allCategories = new Set();
let allTags = new Set();
let allAttributes = new Set();

function renderTagFilter() {
  const tagFilter = document.getElementById("tagFilter");
  const current = tagFilter.value;
  tagFilter.innerHTML = '<option value="all">All Tags</option>';
  Array.from(allTags).sort().forEach(tag => {
    tagFilter.innerHTML += `<option value="${tag}">${tag.toUpperCase()}</option>`;
  });
  tagFilter.value = current;
}

function renderAttributeFilter() {
  const attrFilter = document.getElementById("attrFilter");
  const current = attrFilter.value;
  attrFilter.innerHTML = '<option value="all">All Attributes</option>';
  Array.from(allAttributes).sort().forEach(attr => {
    attrFilter.innerHTML += `<option value="${attr}">${attr.toUpperCase()}</option>`;
  });
  attrFilter.value = current;
}



function renderGallery(filter = "all", search = "", sort = "latest", tag = "all", attr = "all", mapCreator = "all") {
  const gallery = document.getElementById("gallery");
  let filtered = items.filter(item => {
    // Always require category match unless 'all' is selected
    const matchesCategory = filter === "all" || (item.category && item.category.toLowerCase() === filter.toLowerCase());
    if (!matchesCategory) return false;
    // Only apply tag/attr/mapCreator filters to items in the selected category
    const matchesTag = tag === "all" || (item.tags && item.tags.some(t => t && t.toString().toUpperCase() === tag.toUpperCase()));
    const matchesAttr = attr === "all" || (item.attributes && item.attributes.some(a => a && a.toString().toUpperCase() === attr.toUpperCase()));
    const matchesMapCreator = (filter.toUpperCase() === "MAPS" || (item.category && item.category.toLowerCase() === 'maps')) && mapCreator !== "all"
      ? (item.mapCreator && typeof item.mapCreator === 'string' && item.mapCreator.trim().toUpperCase() === mapCreator.trim().toUpperCase())
      : true;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesAttr && matchesMapCreator && matchesSearch;
  });
  // Move pinned items to the top
  let pinned = filtered.filter(i => i.pin);
  let unpinned = filtered.filter(i => !i.pin);
  if (sort === "alpha") {
    pinned = pinned.slice().sort((a, b) => a.title.localeCompare(b.title));
    unpinned = unpinned.slice().sort((a, b) => a.title.localeCompare(b.title));
  } else {
    pinned = pinned.slice().reverse();
    unpinned = unpinned.slice().reverse();
  }
  filtered = pinned.concat(unpinned);
  gallery.innerHTML = "";
  if (filtered.length === 0) {
    gallery.innerHTML = '<p>No items found.</p>';
    return;
  }
  let html = "";
  filtered.forEach((item, idx) => {
    let media = "";
    function getYouTubeId(url) {
      if (!url) return null;
      let match = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      return match ? match[1] : null;
    }
    let youTubeId = getYouTubeId(item.src);
    if (!youTubeId && item.videoSrc) youTubeId = getYouTubeId(item.videoSrc);
    if (youTubeId) {
      media = `<img src="https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg" alt="${item.title}">`;
    } else if (item.type === "image") {
      media = `<img src="${item.src}" alt="${item.title}">`;
    } else if (item.type === "video") {
      if (item.src && item.src.includes('youtube.com/embed')) {
        media = `<iframe src="${item.src}" frameborder="0" allowfullscreen style="width:100%;height:180px;border-radius:8px;"></iframe>`;
      } else {
        media = `<video src="${item.src}" muted autoplay loop playsinline></video>`;
      }
    }
    const labelClass = item.labelType === "paid" ? "label-paid" : "label-free";
    let tagHtml = "";
    if (item.tags && item.tags.length) {
      tagHtml = `<div class='card-tags'>` + item.tags.map(t => `<span class='tag'>${t}</span>`).join(' ');
      if (item.category && item.category.toLowerCase() === 'maps' && item.mapCreator) {
      let mcIcon = '';
      if (item.mapCreator.toString().toLowerCase() === 'gabz') {
        mcIcon = ` <img src="src/icons/gabz.png" alt="Gabz" style="height:1.1em;width:1.1em;vertical-align:middle;margin-left:2px;">`;
      }
      tagHtml += ` <span class='tag tag-mapcreator'>${item.mapCreator} ${mcIcon}</span>`;
      }
      tagHtml += `</div>`;
    } else if (item.category && item.category.toLowerCase() === 'maps' && item.mapCreator) {
      tagHtml = `<div class='card-tags'><span class='tag tag-mapcreator'>${item.mapCreator}</span></div>`;
    }
    let attrHtml = "";
    if (item.attributes && item.attributes.length) {
      attrHtml = `<div class='card-tags'>` + item.attributes.map(a => {
        let extra = '';
        let style = '';
        if (a && a.toString().toLowerCase() === 'verified') extra = ' ✅';
        if (a && a.toString().toLowerCase() === 'gabz') extra = ` <img src="src/icons/gabz.png" alt="Gabz" style="height:1.1em;width:1.1em;vertical-align:middle;margin-left:2px;">`;
        if (a && a.toString().toLowerCase() === 'for review') { extra = ' ⏳'; style = 'color:#e74c3c;font-weight:bold;'; }
        return `<span class='tag tag-attr'${style ? ` style="${style}"` : ''}>${a}${extra}</span>`;
      }).join(' ') + `</div>`;
    }
    // Show coordinates if present (for maps), bottom right
    let coordsHtml = '';
    if (item.category && item.category.toLowerCase() === 'maps' && item.location) {
      let coords = item.location;
      const match = coords.match(/^vec3\(([^)]+)\)$/i);
      if (match) coords = match[1];
      coordsHtml = `<div class="card-coords" style="position:absolute;bottom:0.5em;right:0.7em;z-index:2;"><span class="card-coords-span" style="background:#181920;padding:0.18em 0.6em;border-radius:6px;color:#fff;font-family:monospace;font-size:0.98em;user-select:all;cursor:pointer;">${coords}</span></div>`;
    }
    html += `
      <div class="card${item.pin ? ' card-pinned' : ''}" data-idx="${idx}" style="position:relative;">
        <div class="card-media">
          ${media}
          ${item.pin ? '<div class="pin-icon" title="Pinned">📌</div>' : ''}
          <div class="card-overlay">
            <span class="card-label ${labelClass}" style="border-radius:0;">${item.label}</span>
            <div class="card-title" title="${item.title}">${item.title}</div>
          </div>
        </div>
        <div class="card-info">
          <div class="card-desc">${item.description}</div>
          ${tagHtml}
          ${attrHtml}
        </div>
        ${coordsHtml}
      </div>
    `;
  });
  gallery.innerHTML = html;
  // Add click event for details modal
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', function(e) {
      // Prevent modal if clicking the coords span
      if (e.target.classList.contains('card-coords-span')) return;
      // Remove border-radius from card, then restore
      const prevRadius = card.style.borderRadius;
      card.style.borderRadius = '0';
      setTimeout(() => { card.style.borderRadius = prevRadius || ''; }, 900);
      const idx = this.getAttribute('data-idx');
      showDetails(filtered[idx]);
    });
  });
  // Add click event for coords span to remove border-radius
  document.querySelectorAll('.card-coords-span').forEach(span => {
    span.onclick = function(e) {
      e.stopPropagation();
      const prevRadius = span.style.borderRadius;
      span.style.borderRadius = '0';
      setTimeout(() => { span.style.borderRadius = prevRadius; }, 900);
    };
  });
}

// Helper: get data file for category

function getDataFilesForCategory(category) {
  if (!category || category === 'all') {
    return ['maps.json', 'vehicles.json', 'clothing.json', 'scripts.json', 'others.json'];
  }
  if (category.toLowerCase() === 'maps') return ['maps.json'];
  if (category.toLowerCase() === 'vehicles') return ['vehicles.json'];
  if (category.toLowerCase() === 'clothing') return ['clothing.json'];
  if (category.toLowerCase() === 'scripts') return ['scripts.json'];
  if (category.toLowerCase() === 'other' || category.toLowerCase() === 'others') return ['others.json'];
  return ['maps.json'];
}


function loadDataAndRender(category) {
  const files = getDataFilesForCategory(category);
  if (files.length === 1) {
    // Single file, normal fetch
    fetch(files[0])
      .then(res => res.json())
      .then(data => processAndRenderItems(data, category));
  } else {
    // Multiple files, fetch all and merge
    Promise.all(files.map(f => fetch(f).then(res => res.json()).catch(() => [])))
      .then(allData => {
        // Merge all arrays
        const merged = [].concat(...allData);
        processAndRenderItems(merged, category);
      });
  }
}


function processAndRenderItems(data, category) {
  // Re-attach event listeners for tag, attribute, and mapCreator filters after rebuilding
  const tagFilter = document.getElementById('tagFilter');
  const attrFilter = document.getElementById('attrFilter');
  tagFilter.onchange = applyAllFilters;
  attrFilter.onchange = applyAllFilters;
  const mapCreatorFilter = document.getElementById('mapCreatorFilter');
  mapCreatorFilter.onchange = applyAllFilters;
  // Normalize mapCreator to always be a string
  items = data.map(i => {
    if (i.hasOwnProperty('mapCreator')) {
      if (Array.isArray(i.mapCreator)) {
        i.mapCreator = i.mapCreator.length > 0 ? i.mapCreator.join(', ') : '';
      } else if (typeof i.mapCreator !== 'string') {
        i.mapCreator = '';
      }
    }
    return i;
  });
  allCategories = new Set(items.map(i => i.category));
  // Only collect tags/attributes/mapCreators for the current category
  let filteredItems = items;
  if (category && category !== 'all') {
    filteredItems = items.filter(i => i.category && i.category.toUpperCase() === category.toUpperCase());
  }
  allTags = new Set();
  allAttributes = new Set();
  let allMapCreators = new Set();
  filteredItems.forEach(i => {
    if (i.tags && Array.isArray(i.tags)) {
      i.tags.forEach(tag => allTags.add(tag.toString()));
    }
    if (i.attributes && Array.isArray(i.attributes)) {
      i.attributes.forEach(attr => allAttributes.add(attr.toString()));
    }
    if (i.category && i.category.toLowerCase() === 'maps' && i.mapCreator) {
      allMapCreators.add(i.mapCreator);
    }
  });
  renderTagFilter();
  renderAttributeFilter();
  // Populate mapCreatorFilter
  mapCreatorFilter.innerHTML = '<option value="all">All Map Creators</option>';
  Array.from(allMapCreators).sort().forEach(mc => {
    mapCreatorFilter.innerHTML += `<option value="${mc}">${mc}</option>`;
  });
  // Always reset tag and attribute filters to 'all' after category changes
  document.getElementById('tagFilter').value = 'all';
  document.getElementById('attrFilter').value = 'all';
  document.getElementById('mapCreatorFilter').value = 'all';
  applyAllFilters();
}

function applyAllFilters() {
  const tagFilter = document.getElementById('tagFilter');
  const attrFilter = document.getElementById('attrFilter');
  const mapCreatorFilter = document.getElementById('mapCreatorFilter');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  // Always use 'all' as the category filter in All mode
  renderGallery(
    'all',
    searchInput ? searchInput.value : '',
    sortSelect ? sortSelect.value : 'latest',
    tagFilter.value,
    attrFilter.value,
    mapCreatorFilter.value
  );
}


// Helper: get category from URL (?category=...)
function getUrlCategory() {
  const params = new URLSearchParams(window.location.search);
  return params.get('category');
}


// Initial load: use category from URL or default
const urlCat = getUrlCategory();
if (!urlCat || urlCat === 'all') {
  loadDataAndRender('all');
} else {
  loadDataAndRender(urlCat);
}
setupFilters();

setupFilters = function() {
  // Only set up listeners for tag, attr, mapCreator, search, and sort
  tagFilter.addEventListener("change", applyAllFilters);
  attrFilter.addEventListener("change", applyAllFilters);
  mapCreatorFilter.addEventListener("change", applyAllFilters);
  searchInput.addEventListener("input", applyAllFilters);
  sortSelect.addEventListener("change", applyAllFilters);
};
