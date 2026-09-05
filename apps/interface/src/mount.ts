import './main';

export function mount(el: HTMLElement) {
  const app = document.createElement('my-app');
  el.appendChild(app);
  return () => {
    app.remove();
  };
}
