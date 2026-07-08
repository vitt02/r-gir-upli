// Supported languages. To add a new one later (e.g. "sq" for Albanian):
// 1) add its dictionary to I18N in translations.js
// 2) add it here
// 3) add an <option> for it in the language <select> on every page
var LANGUAGES = ['de', 'fr', 'en', 'it', 'pt'];

function currentLang(){
  var saved = localStorage.getItem('raegiraeupli-lang');
  return (saved && LANGUAGES.indexOf(saved) !== -1) ? saved : 'de';
}

function t(key, lang){
  lang = lang || currentLang();
  var dict = I18N[lang] || I18N.de;
  if(dict && key in dict) return dict[key];
  return (I18N.de && I18N.de[key]) || '';
}

function applyI18n(lang){
  document.documentElement.setAttribute('lang', lang);

  document.querySelectorAll('[data-i18n]').forEach(function(el){
    el.textContent = t(el.getAttribute('data-i18n'), lang);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el){
    el.innerHTML = t(el.getAttribute('data-i18n-html'), lang);
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(function(el){
    el.alt = t(el.getAttribute('data-i18n-alt'), lang);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'), lang);
  });
  var titleKey = document.body.getAttribute('data-i18n-title');
  if(titleKey) document.title = t(titleKey, lang);
}

function setLang(lang){
  if(LANGUAGES.indexOf(lang) === -1) lang = 'de';
  localStorage.setItem('raegiraeupli-lang', lang);
  var sel = document.getElementById('lang-select');
  if(sel) sel.value = lang;
  applyI18n(lang);
  document.dispatchEvent(new CustomEvent('langchange', {detail: {lang: lang}}));
}

function openLightbox(src, alt){
  var img = document.getElementById('lightbox-img');
  img.src = src;
  img.alt = alt || '';
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox(){ document.getElementById('lightbox').classList.remove('open'); }

function toggleNav(){
  var nav = document.getElementById('site-nav');
  var btn = document.querySelector('.nav-toggle');
  if(!nav) return;
  var isOpen = nav.classList.toggle('open');
  if(btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

document.addEventListener('DOMContentLoaded', function(){
  setLang(currentLang());

  document.querySelectorAll('.modal-overlay').forEach(function(overlay){
    overlay.addEventListener('click', function(e){
      if(e.target === this) overlay.classList.remove('open');
    });
  });

  var siteNav = document.getElementById('site-nav');
  var navToggle = document.querySelector('.nav-toggle');
  if(siteNav && navToggle){
    document.addEventListener('click', function(e){
      if(siteNav.classList.contains('open') && !siteNav.contains(e.target) && e.target !== navToggle && !navToggle.contains(e.target)){
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

// ---- Anmeldung form: validation, autocomplete, conditional fields ----
(function(){
  var form = document.getElementById('anmeldung-form');
  if(!form) return;

  function showError(input, invalid){
    var wrap = input.closest('div');
    var err = wrap ? wrap.querySelector('.field-error') : null;
    input.classList.toggle('invalid', !!invalid);
    if(err) err.classList.toggle('show', !!invalid);
    return !invalid;
  }

  var LETTERS = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
  var TEXT = /^[A-Za-zÀ-ÖØ-öø-ÿ\s,.'-]+$/;

  function checkPatternField(input){
    var mode = input.getAttribute('data-validate');
    var optional = mode.indexOf('optional') !== -1;
    var re = (mode === 'text-optional') ? TEXT : LETTERS;
    var v = input.value.trim();
    var ok = (optional && v === '') || re.test(v);
    return showError(input, !ok);
  }

  document.querySelectorAll('[data-validate]').forEach(function(input){
    input.addEventListener('input', function(){ checkPatternField(input); });
  });

  // Birthdate: must correspond to an age between 2.5 and 4 years
  var birthdate = document.getElementById('birthdate');
  function checkBirthdate(){
    if(!birthdate) return true;
    var ok = false;
    if(birthdate.value){
      var dob = new Date(birthdate.value + 'T00:00:00');
      if(!isNaN(dob.getTime())){
        var ageYears = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        ok = ageYears >= 2.5 && ageYears <= 4;
      }
    }
    return showError(birthdate, !ok);
  }
  if(birthdate) birthdate.addEventListener('input', checkBirthdate);

  // E-Mail format
  var email = document.getElementById('email');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function checkEmail(){
    if(!email) return true;
    var ok = EMAIL_RE.test(email.value.trim());
    return showError(email, !ok);
  }
  if(email) email.addEventListener('input', checkEmail);

  // Swiss phone numbers: +41761234567, +41 76 123 45 67, 0761234567, 076 123 45 67
  var SWISS_PHONE = /^(\+41|0)[1-9]\d{8}$/;
  function makePhoneChecker(input, optional){
    return function(){
      var v = input.value.replace(/[\s-]/g, '');
      var ok = (optional && v === '') || SWISS_PHONE.test(v);
      return showError(input, !ok);
    };
  }
  var phone = document.getElementById('phone');
  var phoneMother = document.getElementById('phone-mother');
  var phoneFather = document.getElementById('phone-father');
  var checkPhone = phone ? makePhoneChecker(phone, false) : function(){ return true; };
  var checkPhoneMother = phoneMother ? makePhoneChecker(phoneMother, true) : function(){ return true; };
  var checkPhoneFather = phoneFather ? makePhoneChecker(phoneFather, true) : function(){ return true; };
  if(phone) phone.addEventListener('input', checkPhone);
  if(phoneMother) phoneMother.addEventListener('input', checkPhoneMother);
  if(phoneFather) phoneFather.addEventListener('input', checkPhoneFather);

  // Wer bringt/holt das Kind -> conditional "Andere" text field
  var whoBringsOther = document.getElementById('who-brings-other');
  var whoBringsRadios = document.querySelectorAll('input[name="who-brings"]');
  function checkWhoBringsOther(){
    if(!whoBringsOther) return true;
    if(!whoBringsOther.required) return showError(whoBringsOther, false);
    var v = whoBringsOther.value.trim();
    var ok = v !== '' && LETTERS.test(v);
    return showError(whoBringsOther, !ok);
  }
  whoBringsRadios.forEach(function(radio){
    radio.addEventListener('change', function(){
      var checked = document.querySelector('input[name="who-brings"]:checked');
      var isOther = checked && checked.value === 'andere';
      if(whoBringsOther){
        whoBringsOther.style.display = isOther ? 'block' : 'none';
        whoBringsOther.required = !!isOther;
        if(!isOther) whoBringsOther.value = '';
        checkWhoBringsOther();
      }
    });
  });
  if(whoBringsOther) whoBringsOther.addEventListener('input', checkWhoBringsOther);

  // Nationalität: searchable country datalist, refreshed on language change
  var countryList = document.getElementById('country-list');
  function fillCountries(){
    if(!countryList) return;
    var arr = COUNTRIES[currentLang()] || COUNTRIES.de;
    countryList.innerHTML = '';
    arr.forEach(function(name){
      var opt = document.createElement('option');
      opt.value = name;
      countryList.appendChild(opt);
    });
  }
  fillCountries();
  document.addEventListener('langchange', fillCountries);

  // Strasse: address autocomplete via the free Swiss geo.admin.ch search API
  var streetInput = document.getElementById('street');
  var suggestionBox = document.getElementById('street-suggestions');
  var plzOrt = document.getElementById('plz-ort');
  var debounceTimer = null;
  var activeController = null;

  function renderSuggestions(results){
    suggestionBox.innerHTML = '';
    var items = [];
    (results || []).forEach(function(r){
      // Use the "label" field (clean display text, e.g. "Im Dreispitz 12 <b>8105</b> Regensdorf") -
      // "detail" is an internal search-matching string that also contains BFS numbers and
      // country/canton codes, which is what caused the garbled address before.
      var label = r && r.attrs && r.attrs.label;
      if(!label) return;
      var text = label.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      var m = text.match(/^(.*?)\s(\d{4})\s([A-Za-zÀ-ÖØ-öø-ÿ.'\- ]+)$/);
      if(!m) return;
      items.push({street: m[1].trim(), plz: m[2], ort: m[3].trim()});
    });
    if(!items.length){ suggestionBox.classList.remove('show'); return; }
    items.forEach(function(item){
      var div = document.createElement('div');
      div.textContent = item.street + ', ' + item.plz + ' ' + item.ort;
      div.addEventListener('click', function(){
        streetInput.value = item.street;
        if(plzOrt) plzOrt.value = item.plz + ' ' + item.ort;
        suggestionBox.classList.remove('show');
        suggestionBox.innerHTML = '';
      });
      suggestionBox.appendChild(div);
    });
    suggestionBox.classList.add('show');
  }

  function fetchStreetSuggestions(query){
    if(activeController) activeController.abort();
    if(typeof AbortController !== 'undefined') activeController = new AbortController();
    var url = 'https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=' +
      encodeURIComponent(query) + '&type=locations&origins=address&limit=8';
    fetch(url, activeController ? {signal: activeController.signal} : {})
      .then(function(r){ return r.json(); })
      .then(function(data){ renderSuggestions(data && data.results); })
      .catch(function(){ /* API unreachable - manual entry still works */ });
  }

  if(streetInput && suggestionBox){
    streetInput.addEventListener('input', function(){
      var q = streetInput.value.trim();
      clearTimeout(debounceTimer);
      if(q.length < 3){
        suggestionBox.classList.remove('show');
        suggestionBox.innerHTML = '';
        return;
      }
      debounceTimer = setTimeout(function(){ fetchStreetSuggestions(q); }, 300);
    });
    document.addEventListener('click', function(e){
      if(e.target !== streetInput) suggestionBox.classList.remove('show');
    });
  }

  // Full validation pass on submit
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var valid = true;

    document.querySelectorAll('[data-validate]').forEach(function(input){
      if(!checkPatternField(input)) valid = false;
    });
    if(!checkBirthdate()) valid = false;
    if(!checkEmail()) valid = false;
    if(!checkPhone()) valid = false;
    if(!checkPhoneMother()) valid = false;
    if(!checkPhoneFather()) valid = false;

    // generic required fields without a bilingual message box
    ['nationality', 'street', 'plz-ort'].forEach(function(id){
      var el = document.getElementById(id);
      if(el){
        var ok = el.value.trim() !== '';
        el.classList.toggle('invalid', !ok);
        if(!ok) valid = false;
      }
    });
    if(whoBringsRadios.length && !document.querySelector('input[name="who-brings"]:checked')) valid = false;
    if(!checkWhoBringsOther()) valid = false;

    if(!valid) return;
    alert(t('anmeldung_demo_alert'));
  });
})();
