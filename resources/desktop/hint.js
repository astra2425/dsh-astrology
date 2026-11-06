// The main process supplies a fixed action label through the owned local URL fragment.
const label = document.querySelector('#action-hint');
const render = () => { label.textContent = decodeURIComponent(location.hash.slice(1)); };
render(); window.addEventListener('hashchange', render);
