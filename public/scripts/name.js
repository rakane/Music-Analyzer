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
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready);
} else {
  ready();
}
