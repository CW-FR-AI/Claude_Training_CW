/* ========================================================================
   CLEARWATER — Outils & Personnalisation Claude · Shared JS v1.0
   Wizard logic (renderFamilies / selectFamily / selectCase) + tabs.
   Each page provides a global WIZARD array and a global WIZARD_CONFIG object
   with stage labels and breadcrumb steps.
   ======================================================================== */

(function(){
  if (typeof WIZARD === 'undefined') return; // page sans wizard — script ignoré

  const cfg = (typeof WIZARD_CONFIG !== 'undefined') ? WIZARD_CONFIG : {
    stage1Label: 'Famille',
    stage2Label: 'Cas précis',
    stage3Label: 'Recommandation',
    stage1Question: 'Quelle est <strong>la famille</strong> de votre besoin ?',
    stage2Question: function(famTitle){ return 'Plus précisément, <strong>quel cas</strong> dans &laquo; ' + famTitle + ' &raquo; ?'; },
    block1Label: 'Modèle conseillé',
    block2Label: 'Skill ou outil à invoquer',
    block3Label: 'Méthode — réflexes spécifiques',
    primaryField: 'model',       // .model or .env (the main "pill" field)
    primaryFieldClass: 'modelClass',
    primaryFieldReason: 'modelReason',
    primaryLabel: function(c){ return c.model ? c.model.split(' ')[0] : (c.env || ''); },
    extraBlock: null            // optional second block before method (e.g. format for artifacts)
  };

  const body = document.getElementById('wizardBody');
  const breadcrumb = document.getElementById('breadcrumb');
  if (!body || !breadcrumb) return;

  let state = { family: null, caseId: null };

  function renderFamilies(){
    state.family = null; state.caseId = null;
    updateBreadcrumb();
    let html = '<div class="stage-title fade-in">' + cfg.stage1Question + '</div><div class="family-grid fade-in">';
    WIZARD.forEach((fam, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      html += '<button class="family-card" data-fam="' + fam.id + '">' +
        '<span class="fam-num">' + num + '</span>' +
        '<span class="fam-content"><span class="fam-title">' + fam.title + '</span><span class="fam-desc">' + fam.desc + '</span></span>' +
        '<span class="fam-arrow">&rarr;</span></button>';
    });
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll('.family-card').forEach(b => {
      b.addEventListener('click', () => selectFamily(b.dataset.fam));
    });
  }

  function selectFamily(famId){
    state.family = famId; state.caseId = null;
    const fam = WIZARD.find(f => f.id === famId);
    updateBreadcrumb();
    let html = '<div class="stage-title fade-in">' + cfg.stage2Question(fam.title) + '</div><div class="case-grid fade-in">';
    fam.cases.forEach(c => {
      html += '<button class="case-card" data-case="' + c.id + '">' +
        '<span class="case-title">' + c.title + '</span>' +
        '<span class="case-arrow">Voir la reco &rarr;</span></button>';
    });
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll('.case-card').forEach(b => {
      b.addEventListener('click', () => selectCase(b.dataset.case));
    });
  }

  function selectCase(caseId){
    state.caseId = caseId;
    const fam = WIZARD.find(f => f.id === state.family);
    const c = fam.cases.find(x => x.id === caseId);
    updateBreadcrumb();
    const primary = c[cfg.primaryField];
    const primaryClass = c[cfg.primaryFieldClass];
    const primaryReason = c[cfg.primaryFieldReason];
    const pillLabel = cfg.primaryLabel(c);

    let html = '<div class="reco fade-in">' +
      '<div class="reco-eyebrow">Recommandation pour : ' + fam.title + ' &rsaquo; ' + c.title + '</div>' +
      '<h3>' + c.title + '</h3>' +
      '<div class="reco-block">' +
        '<div class="reco-block-label">' + cfg.block1Label + '</div>' +
        '<div class="reco-model">' +
          '<span class="model-name">' + primary + '</span>' +
          '<span class="pill ' + primaryClass + '">' + pillLabel + '</span>' +
          '<span class="model-reason">' + primaryReason + '</span>' +
        '</div>';
    if (cfg.extraBlock && c[cfg.extraBlock.field]) {
      html += '<div class="reco-tools" style="margin-top:14px">' + c[cfg.extraBlock.field] + '</div>';
    }
    html += '</div>';

    // Optional: a dedicated "share" or "tools" block between primary and method
    if (c.share) {
      html += '<div class="reco-block">' +
        '<div class="reco-block-label">Approche de partage</div>' +
        '<div class="reco-tools">' + c.share + '</div>' +
      '</div>';
    }
    if (c.tools) {
      html += '<div class="reco-block">' +
        '<div class="reco-block-label">' + cfg.block2Label + '</div>' +
        '<div class="reco-tools">' + c.tools + '</div>' +
      '</div>';
    }

    html += '<div class="reco-block">' +
      '<div class="reco-block-label">' + cfg.block3Label + '</div>' +
      '<ol class="reco-method">' + c.method.map(m => '<li>' + m + '</li>').join('') + '</ol>' +
    '</div>';

    if (c.pitfalls) {
      html += '<div class="reco-block"><div class="reco-pitfalls"><strong>Piège à éviter</strong>' + c.pitfalls + '</div></div>';
    }
    html += '<div class="reco-restart"><button class="btn-restart" id="btn-restart">&#x21bb; Recommencer</button></div></div>';
    body.innerHTML = html;
    document.getElementById('btn-restart').addEventListener('click', renderFamilies);
  }

  function updateBreadcrumb(){
    const fam = state.family ? WIZARD.find(f => f.id === state.family) : null;
    const c = state.caseId && fam ? fam.cases.find(x => x.id === state.caseId) : null;
    let html = '';
    if (!state.family) {
      html = '<span class="step active"><span class="label">&#9312; ' + cfg.stage1Label + '</span></span>';
    } else if (!state.caseId) {
      html = '<span class="step done" data-action="reset"><span class="label">&#9312; ' + fam.title + '</span></span>' +
        '<span class="sep">&rsaquo;</span>' +
        '<span class="step active"><span class="label">&#9313; ' + cfg.stage2Label + '</span></span>';
    } else {
      html = '<span class="step done" data-action="reset"><span class="label">&#9312; ' + fam.title + '</span></span>' +
        '<span class="sep">&rsaquo;</span>' +
        '<span class="step done" data-action="back-cases"><span class="label">&#9313; ' + c.title + '</span></span>' +
        '<span class="sep">&rsaquo;</span>' +
        '<span class="step active"><span class="label">&#9314; ' + cfg.stage3Label + '</span></span>';
    }
    html += '<button class="reset" id="bc-reset">Recommencer</button>';
    breadcrumb.innerHTML = html;
    document.getElementById('bc-reset').addEventListener('click', renderFamilies);
    breadcrumb.querySelectorAll('[data-action="reset"]').forEach(el => {
      el.addEventListener('click', renderFamilies);
    });
    breadcrumb.querySelectorAll('[data-action="back-cases"]').forEach(el => {
      el.addEventListener('click', () => selectFamily(state.family));
    });
  }

  renderFamilies();
})();

/* ========================================================================
   TAB TOGGLE (wizard / deep view) — runs on every page that has tabs
   ======================================================================== */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(tab.dataset.view);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
