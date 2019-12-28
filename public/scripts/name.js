const ready = () => {
  let form = document.querySelector('form');
  form.addEventListener('submit', e => {
    e.preventDefault();

    let input = document.querySelector('input');
    let name = input.files[0].name;

    let hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'name');
    hiddenInput.setAttribute('value', name);
    form.appendChild(hiddenInput);
    form.submit();
  });

  let forms = document.getElementsByClassName('form');
  for (let i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', e => {
      document.querySelector('h1').style.display = 'none';
      document.querySelector('h1').style.display = 'none';
      document.getElementById('root-container').style.display = 'none';
      document.getElementById('loader-container').style.display = 'block';
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready);
} else {
  ready();
}
