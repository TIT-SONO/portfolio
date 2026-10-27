fetch('/content/site.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (data) {
  var soumission = 'mailto:' + data.courriel + '?subject=' + encodeURIComponent('Demande de soumission') + '&body=' + encodeURIComponent("Bonjour Tristan,\n\nType d'événement :\nDate :\nLieu :\nNombre de personnes :\nBesoin (avec ton matériel ou sur le système en place) :\n\nMerci!");
  var contrat = 'mailto:' + data.courriel + '?subject=' + encodeURIComponent('Contrat de technicien de son') + '&body=' + encodeURIComponent('Bonjour Tristan,\n\nEntreprise :\nDate(s) :\nLieu :\nPoste (FOH, moniteurs, lecture) :\nConsole :\n\nMerci!');
  function tel(n) { return 'tel:' + String(n).replace(/[^0-9+]/g, ''); }
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
    el('div', { class: 'name' }, [data.marque || data.nom, el('small', { text: data.nom + ', ' + data.metier.toLowerCase() })]),
    el('nav', { 'aria-label': 'Navigation principale' }, [el('ul', null, [['#tm-services', 'Services'], ['#tm-expertise', 'Expertise'], ['#tm-realisations', 'Réalisations'], ['#tm-contact', 'Contact']]
      .map(function (x) { return el('li', null, [el('a', { href: x[0], text: x[1] })]); }))])
  ])]));
  var main = el('main');
  main.appendChild(el('div', { class: 'hero' }, [el('img', { src: data.heroImage.src, alt: data.heroImage.alt }),
    el('div', { class: 'over' }, [el('div', { class: 'wrap' }, [el('h1', { text: data.heroTitre }), el('p', { text: data.heroTexte }),
      el('p', { class: 'cta' }, [el('a', { class: 'btn', href: soumission, text: 'Demander une soumission' }), el('a', { class: 'btn ghost', href: '#tm-realisations', text: 'Voir mes réalisations' })])])])]));
  main.appendChild(el('section', { id: 'tm-profil' }, [el('div', { class: 'wrap' }, [el('h2', { text: 'Profil' }), el('p', { text: data.profil })])]));
  if (data.services && data.services.length) main.appendChild(el('section', { id: 'tm-services' }, [el('div', { class: 'wrap' }, [
    el('h2', { text: 'Services' }),
    el('div', { class: 'three' }, data.services.map(function (x) { return el('div', null, [el('h3', { text: x.titre }), el('p', { text: x.texte })]); }))
  ])]));
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
      el('h3', { text: x.titre }), x.quand ? el('p', { class: 'when', text: x.quand }) : null, el('p', { text: x.texte }),
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
    el('div', null, [el('h2', { text: 'Vous organisez un événement?' }), el('p', { text: 'Un festival, un gala, un spectacle ou un événement privé.' }), el('p', { class: 'cta' }, [el('a', { class: 'btn', href: soumission, text: 'Demander une soumission' })])]),
    el('div', null, [el('h2', { text: 'Vous cherchez un technicien?' }), el('p', { text: 'Pour une entreprise de son ou une équipe de production.' }), el('p', { class: 'cta' }, [el('a', { class: 'btn ghost', href: contrat, text: 'Me proposer un contrat' })])]),
    el('div', null, [el('h2', { text: 'Contact' }), el('p', null, ['Téléphone : ', el('a', { href: tel(data.telephone), text: data.telephone })]), el('p', null, ['Courriel : ', el('a', { href: 'mailto:' + data.courriel, text: data.courriel })]), el('p', { class: 'brands', text: 'Marques utilisées : ' + data.marques })]),
    el('p', { class: 'legal', text: '© ' + new Date().getFullYear() + ' ' + (data.marque ? data.marque + ', ' : '') + data.nom })
  ])]));
  preview();
}).catch(function () {
  document.getElementById('tm-app').innerHTML = '<p style="padding:24px 16px">Le site n\'a pas pu se charger. Recharge la page, ou écris à <a href="mailto:TIT-SONO@outlook.com">TIT-SONO@outlook.com</a>.</p>';
});
