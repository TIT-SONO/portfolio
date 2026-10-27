fetch('/content/site.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (data) {
  document.title = data.nom + ' · ' + data.metier;
  var selected = 0, shown = 0;
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in (attrs || {})) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'on') for (var e in attrs.on) n.addEventListener(e, attrs.on[e]);
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function link(l) { return el('a', { href: l.url, target: '_blank', rel: 'noopener', text: l.texte || 'Voir les photos' }); }
  function select(i) {
    if (i === selected) return;
    selected = i; shown = 0;
    document.querySelectorAll('#tm .project').forEach(function (n) { n.classList.toggle('active', n.getAttribute('data-i') === String(i)); });
    preview();
  }
  function preview() {
    var box = document.getElementById('tm-preview'); box.textContent = '';
    var x = data.realisations[selected], ph = x.photos || [];
    if (!ph.length) {
      box.appendChild(x.lien && x.lien.url ? el('p', null, [x.titre + ' : les photos sont publiées ailleurs. ', link(x.lien)]) : el('p', { class: 'muted', text: x.titre + ' : pas encore de photos.' }));
      return;
    }
    var cur = ph[shown] || ph[0];
    box.appendChild(el('figure', null, [el('img', { src: cur.src, alt: cur.alt }), el('figcaption', { text: cur.legende })]));
    if (ph.length > 1) box.appendChild(el('div', { class: 'thumbs' }, ph.map(function (p, j) {
      return el('button', { type: 'button', 'aria-pressed': String(j === shown), 'aria-label': 'Photo ' + (j + 1) + ' : ' + p.legende,
        on: { click: function () { shown = j; preview(); }, mouseenter: function () { if (shown !== j) { shown = j; preview(); } } } }, [el('img', { src: p.src, alt: '' })]);
    })));
  }
  var app = document.getElementById('tm-app');
  app.appendChild(el('header', null, [el('div', { class: 'wrap' }, [
    el('div', { class: 'name' }, [data.nom, el('small', { text: data.metier })]),
    el('nav', { 'aria-label': 'Navigation principale' }, [el('ul', null, [['#tm-profil', 'Profil'], ['#tm-expertise', 'Expertise'], ['#tm-realisations', 'Réalisations'], ['#tm-contact', 'Contact']]
      .map(function (x) { return el('li', null, [el('a', { href: x[0], text: x[1] })]); }))])
  ])]));
  var main = el('main');
  main.appendChild(el('div', { class: 'hero' }, [el('img', { src: data.heroImage.src, alt: data.heroImage.alt }),
    el('div', { class: 'over' }, [el('div', { class: 'wrap' }, [el('h1', { text: data.heroTitre }), el('p', { text: data.heroTexte })])])]));
  main.appendChild(el('section', { id: 'tm-profil' }, [el('div', { class: 'wrap' }, [el('h2', { text: 'Profil' }), el('p', { text: data.profil })])]));
  main.appendChild(el('section', { class: 'band', id: 'tm-expertise' }, [el('div', { class: 'wrap' }, [
    el('h2', { text: 'Expertise' }),
    el('div', { class: 'three' }, data.expertise.map(function (x) { return el('div', null, [el('h3', { text: x.titre }), el('p', { text: x.texte })]); })),
    el('h3', { text: 'Consoles et logiciels' }),
    el('ul', { class: 'tools' }, data.outils.map(function (t) { return el('li', { text: t }); })),
    el('p', { class: 'muted', text: data.outilsNote })
  ])]));
  var items = data.realisations.map(function (x, i) {
    var ph = x.photos || [], n = ph.length;
    var art = el('article', { class: 'project' + (i === 0 ? ' active' : ''), 'data-i': String(i) }, [
      el('h3', { text: x.titre }), el('p', { class: 'when', text: x.quand }), el('p', { text: x.texte }),
      x.lien && x.lien.url ? el('p', null, [link(x.lien), el('span', { class: 'muted', text: ' (nouvel onglet)' })]) : null,
      n ? el('button', { type: 'button', class: 'see', 'aria-controls': 'tm-preview', text: n > 1 ? 'Voir les ' + n + ' photos' : 'Voir la photo', on: { click: function () { select(i); } } }) : null,
      el('div', { class: 'inline-photos' }, ph.map(function (p) { return el('figure', null, [el('img', { src: p.src, alt: p.alt, loading: 'lazy' }), el('figcaption', { text: p.legende })]); }))
    ]);
    art.addEventListener('mouseenter', function () { select(i); });
    return el('li', null, [art]);
  });
  main.appendChild(el('section', { id: 'tm-realisations' }, [el('div', { class: 'wrap' }, [
    el('h2', { text: 'Réalisations' }),
    el('div', { class: 'real-grid' }, [el('ul', { class: 'list-plain' }, items), el('div', { class: 'preview', id: 'tm-preview', role: 'region', 'aria-label': 'Photos du projet choisi', 'aria-live': 'polite' })])
  ])]));
  app.appendChild(main);
  app.appendChild(el('footer', { id: 'tm-contact' }, [el('div', { class: 'wrap' }, [
    el('div', null, [el('h2', { text: 'Contact' }), el('p', { text: 'Téléphone : ' + data.telephone }), el('p', null, ['Courriel : ', el('a', { href: 'mailto:' + data.courriel, text: data.courriel })])]),
    el('div', null, [el('h2', { text: 'Marques utilisées' }), el('p', { class: 'brands', text: data.marques })]),
    el('p', { class: 'legal', text: '© ' + new Date().getFullYear() + ' ' + data.nom })
  ])]));
  preview();
});
