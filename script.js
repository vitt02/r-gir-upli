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

document.addEventListener('DOMContentLoaded', function(){
  var saved = localStorage.getItem('raegiraeupli-lang');
  if(saved) setLang(saved);

  var modal = document.getElementById('modal');
  if(modal){
    modal.addEventListener('click', function(e){
      if(e.target === this) closeModal();
    });
  }
});
