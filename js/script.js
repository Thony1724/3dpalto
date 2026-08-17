document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1) Pestañas de la carta (filtro por categoría)
  ---------------------------------------------------------- */
  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('.dish-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const cat = tab.dataset.cat;
      cards.forEach(card => {
        card.hidden = card.dataset.cat !== cat;
      });
    });
  });

  /* ----------------------------------------------------------
     2) Visor 3D / RA (modal + <model-viewer>)
  ---------------------------------------------------------- */
  const modal        = document.getElementById('viewerModal');
  const backdrop      = document.getElementById('viewerBackdrop');
  const closeBtn       = document.getElementById('viewerClose');
  const modelViewer     = document.getElementById('modelViewer');
  const viewerTitle      = document.getElementById('viewerTitle');
  const viewerHint        = document.getElementById('viewerHint');
  const openTriggers        = document.querySelectorAll('[data-open-viewer]');

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  function updateHint(){
    if (isMobile) {
      viewerHint.textContent = 'Arrastra para girar · toca “Ver en tu mesa (RA)” para activar la cámara.';
    } else {
      viewerHint.textContent = 'Arrastra para girar el plato · rueda del mouse para acercar.';
    }
  }

  function openViewer(trigger){
    const name   = trigger.dataset.name  || 'Plato';
    const model  = trigger.dataset.model;
    const poster = trigger.dataset.poster;

    viewerTitle.textContent = name;
    modelViewer.setAttribute('alt', name + ' en 3D');
    if (poster) modelViewer.setAttribute('poster', poster);
    // Se asigna el modelo justo al abrir (carga diferida: no pesa en la carta)
    if (model && modelViewer.getAttribute('src') !== model) {
      modelViewer.setAttribute('src', model);
    }

    updateHint();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeViewer(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openTriggers.forEach(btn => btn.addEventListener('click', () => openViewer(btn)));
  closeBtn.addEventListener('click', closeViewer);
  backdrop.addEventListener('click', closeViewer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeViewer();
  });

  /* Feedback mientras la sesión de RA está activa (cámara encendida) */
  modelViewer.addEventListener('ar-status', (ev) => {
    if (ev.detail.status === 'session-started') {
      viewerHint.textContent = 'Cámara activa: mueve el celular para ubicar el plato sobre tu mesa.';
    } else if (ev.detail.status === 'not-presenting') {
      updateHint();
    }
  });

  /* Si el dispositivo no soporta RA, model-viewer oculta el botón "ar-button"
     automáticamente; ajustamos igual el texto de ayuda por si acaso. */
  modelViewer.addEventListener('load', () => updateHint());
});
