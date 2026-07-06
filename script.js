function setLang(lang){
  document.documentElement.className = lang === 'fr' ? 'fr' : '';
  document.getElementById('btn-de').classList.toggle('active', lang === 'de');
  document.getElementById('btn-fr').classList.toggle('active', lang === 'fr');
  document.querySelectorAll('option[data-de]').forEach(function(opt){
    opt.textContent = lang === 'fr' ? opt.getAttribute('data-fr') : opt.getAttribute('data-de');
  });
  localStorage.setItem('raegiraeupli-lang', lang);
}

function openModal(){ document.getElementById('modal').classList.add('open'); }
function closeModal(){ document.getElementById('modal').classList.remove('open'); }

function openLightbox(src, alt){
  var img = document.getElementById('lightbox-img');
  img.src = src;
  img.alt = alt || '';
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox(){ document.getElementById('lightbox').classList.remove('open'); }

document.addEventListener('DOMContentLoaded', function(){
  var saved = localStorage.getItem('raegiraeupli-lang');
  if(saved) setLang(saved);

  document.querySelectorAll('.modal-overlay').forEach(function(overlay){
    overlay.addEventListener('click', function(e){
      if(e.target === this) overlay.classList.remove('open');
    });
  });
});
