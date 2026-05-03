/* ══════════════════════════════════════════════════════════════════════════════
   mainjs.js — Abasse Minté Portfolio
   Structure :
   1.  SPOTLIGHT & CURSEUR PERSONNALISÉ
   2.  PARALLAX DU TEXTE D'ARRIÈRE-PLAN (hero "JAVA")
   3.  TYPEWRITER
   4.  REVEAL AU SCROLL (IntersectionObserver)
   5.  BARRES DE COMPÉTENCES
   6.  COMPTEURS ANIMÉS (stats)
   7.  EFFET MAGNÉTIQUE
   8.  NAVIGATION ACTIVE AU SCROLL
   9.  ADAPTATION COULEUR NAVBAR (sombre/clair)
   10. ANIMATION D'ENTRÉE DU HERO
══════════════════════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════════════════════════
   1. SPOTLIGHT & CURSEUR PERSONNALISÉ
   Le spotlight (halo) est mis à jour instantanément via style.left/top.
   Le curseur-anneau utilise un lerp (interpolation linéaire) :
   chaque frame, il se rapproche de la souris d'un facteur 0.28 → effet fluide.
   Le curseur-point suit instantanément la souris pour ne pas perdre en précision.
══════════════════════════════════════════════════════════════════════════════ */
const spotlight = document.getElementById('spotlight');
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let rafPending = false;

/* ── Un seul listener mousemove → tout géré dans un RAF ── */
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  /* Spotlight et point central : mise à jour immédiate (pas de lag perceptible) */
  spotlight.style.left = mouseX + 'px';
  spotlight.style.top  = mouseY + 'px';
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';

  /* Parallax hero : throttlé via flag RAF pour ne pas bloquer */
  if (heroBg && !rafPending) {
    rafPending = true;
    requestAnimationFrame(() => {
      const x = (mouseX / window.innerWidth  - 0.5) * 30;
      const y = (mouseY / window.innerHeight - 0.5) * 15;
      heroBg.style.transform = `translateY(calc(-50% + ${y}px)) translateX(${x}px)`;
      rafPending = false;
    });
  }
});

/* Boucle RAF pour l'anneau du curseur (lerp) */
function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.28;
  cursorY += (mouseY - cursorY) * 0.28;
  cursor.style.left = cursorX + 'px';
  cursor.style.top  = cursorY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

/* Hover state curseur */
document.querySelectorAll('a, button, .magnetic, .stat, .about-card, .project-card, .yt-stair, .contact-item')
  .forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });


/* ══════════════════════════════════════════════════════════════════════════════
   2. PARALLAX DU TEXTE D'ARRIÈRE-PLAN
   "JAVA" en arrière-plan du hero se déplace légèrement selon la position
   de la souris (effet de profondeur). Facteurs 30px et 15px = amplitude.
══════════════════════════════════════════════════════════════════════════════ */
const heroBg = document.querySelector('.hero-bg-text');
/* Le parallax de heroBg est géré dans le listener mousemove principal (section 1) */


/* ══════════════════════════════════════════════════════════════════════════════
   3. TYPEWRITER
   Boucle sur un tableau de phrases. Deux états : écriture et suppression.
   - Délai de 2s après écriture complète avant de supprimer
   - Vitesse d'écriture : 90ms/caractère | suppression : 60ms/caractère
   - Le DOM #typewriter est mis à jour avec textContent (pas innerHTML)
══════════════════════════════════════════════════════════════════════════════ */
const tw = document.getElementById('typewriter');

const phrases = [
  'développement logiciel.',
  'Java & Spring Boot.',
  'Clean Architecture.',
  'SOLID Principles.',
  'Design Patterns.',
  'logiciel Java.',
];

let pi = 0;        /* index de la phrase courante */
let ci = 0;        /* index du caractère courant */
let deleting = false;

function typewriter() {
  const phrase = phrases[pi];

  if (!deleting) {
    /* Mode écriture : ajoute un caractère */
    tw.textContent = phrase.slice(0, ++ci);

    if (ci === phrase.length) {
      /* Phrase complète : pause 2s avant de commencer la suppression */
      setTimeout(() => deleting = true, 2000);
      setTimeout(typewriter, 2100);
      return;
    }
  } else {
    /* Mode suppression : retire un caractère */
    tw.textContent = phrase.slice(0, --ci);

    if (ci === 0) {
      /* Phrase effacée : passe à la suivante */
      deleting = false;
      pi = (pi + 1) % phrases.length;
    }
  }

  /* Délai différent selon le mode */
  setTimeout(typewriter, deleting ? 60 : 90);
}

/* Démarre après 800ms pour laisser le hero apparaître */
setTimeout(typewriter, 800);


/* ══════════════════════════════════════════════════════════════════════════════
   4. REVEAL AU SCROLL
   Tous les éléments .reveal-up sont observés par IntersectionObserver.
   Quand ils entrent dans le viewport (seuil 12%), la classe .visible est ajoutée.
   Un stagger est calculé selon la position de l'élément parmi ses frères siblings :
   chaque élément est retardé de 80ms × son index.
══════════════════════════════════════════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal-up');

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      /* Calcule le délai de stagger selon la position parmi les frères */
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal-up')];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 80}ms`;

      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target); /* n'observe qu'une seule fois */
    }
  });
}, { threshold: 0.12 }); /* déclenche quand 12% de l'élément est visible */

revealEls.forEach(el => revealObs.observe(el));


/* ══════════════════════════════════════════════════════════════════════════════
   5. BARRES DE COMPÉTENCES
   Quand un .skill-block entre dans le viewport, les .skill-fill à l'intérieur
   reçoivent leur largeur cible (data-w%). La transition CSS (1.2s) anime le tout.
══════════════════════════════════════════════════════════════════════════════ */
const barObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      /* Anime toutes les barres du bloc */
      entry.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%'; /* déclenche la transition CSS */
      });
      barObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 }); /* déclenche à 30% de visibilité du bloc */

document.querySelectorAll('.skill-block').forEach(b => barObs.observe(b));


/* ══════════════════════════════════════════════════════════════════════════════
   6. COMPTEURS ANIMÉS
   Quand .about-stats entre dans le viewport, chaque .stat-num[data-target]
   incrémente de 0 jusqu'à la valeur cible en 40 étapes de 30ms (≈ 1.2s).
══════════════════════════════════════════════════════════════════════════════ */
const statObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num[data-target]').forEach(el => {
        const target = +el.dataset.target; /* valeur cible (ex: 9, 90) */
        let current = 0;
        const step = target / 40; /* incrément par tick */

        const interval = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.round(current);
          if (current >= target) clearInterval(interval); /* arrête quand cible atteinte */
        }, 30); /* tick toutes les 30ms */
      });
      statObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.about-stats').forEach(s => statObs.observe(s));


/* ══════════════════════════════════════════════════════════════════════════════
   7. EFFET MAGNÉTIQUE
   Au survol d'un élément .magnetic, calcule le vecteur souris → centre,
   puis applique un translate proportionnel (facteur 0.22 = intensité).
   Au départ de la souris, remet le transform à 0 (la transition CSS gère le retour).
══════════════════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.magnetic').forEach(el => {

  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2; /* centre horizontal de l'élément */
    const cy = rect.top  + rect.height / 2; /* centre vertical de l'élément */
    const dx = (e.clientX - cx) * 0.22;    /* déplacement X proportionnel */
    const dy = (e.clientY - cy) * 0.22;    /* déplacement Y proportionnel */
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0,0)'; /* retour à la position initiale */
  });

});


/* ══════════════════════════════════════════════════════════════════════════════
   8. NAVIGATION ACTIVE AU SCROLL
   Observe chaque section. Quand elle est à 40% dans le viewport,
   le lien correspondant dans la navbar reçoit la classe .active.
   La correspondance se fait via l'attribut href="#id" du lien.
══════════════════════════════════════════════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-item');

const navObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navItems.forEach(n => {
        /* Active le lien dont le href correspond à la section visible */
        n.classList.toggle('active', n.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObs.observe(s));


/* ══════════════════════════════════════════════════════════════════════════════
   9. ADAPTATION COULEUR NAVBAR (SOMBRE / CLAIR)
   Quand une section .section-dark entre dans le viewport, le body reçoit
   .section-dark-active → le spotlight bascule en version lumineuse (CSS).
   La navbar adapte aussi sa couleur de bordure en temps réel.
══════════════════════════════════════════════════════════════════════════════ */
const sidenav = document.querySelector('.sidenav');

const darkObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    if (entry.target.classList.contains('section-dark')) {
      /* Section sombre active */
      document.body.classList.add('section-dark-active');
      sidenav.style.color           = '#fff';
      sidenav.style.borderLeftColor = '#1a1917';
    } else {
      /* Section claire active */
      document.body.classList.remove('section-dark-active');
      sidenav.style.color           = '';
      sidenav.style.borderLeftColor = '';
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => darkObs.observe(s));


/* ══════════════════════════════════════════════════════════════════════════════
   10. ANIMATION D'ENTRÉE DU HERO
   Au chargement de la page, les éléments .reveal-up du hero reçoivent
   immédiatement la classe .visible avec un stagger de 140ms entre chacun.
   Démarre après 200ms pour laisser le navigateur terminer le rendu initial.
══════════════════════════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
    el.style.transitionDelay = `${i * 140 + 200}ms`; /* stagger progressif */
    el.classList.add('visible');
  });
});
