import { Show } from 'solid-js';
import './app.css';
import Header from '$lib/components/Header';
import Footer from '$lib/components/Footer';
import Home from '$lib/components/Home';
import NotFound from '$lib/components/NotFound';
import RemoteApp from './RemoteApp';
import { remotes } from './remotes';
import { path } from './router';

function Landing(props: { path: string }) {
  return (
    <div class="landing-site">
      <a class="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      {props.path === '/' ? <Home /> : <NotFound />}
      <Footer />
    </div>
  );
}

export default function App() {
  const remote = () =>
    remotes.find(
      (entry) =>
        path() === entry.prefix || path().startsWith(`${entry.prefix}/`),
    );

  return (
    <Show when={remote()} keyed fallback={<Landing path={path()} />}>
      {(entry) => <RemoteApp load={entry.load} />}
    </Show>
  );
}
