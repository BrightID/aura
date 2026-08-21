
import root from '../root.js';
import { set_building, set_prerendering } from '$app/env/internal';
import { set_assets } from '$app/paths/internal/server';
import { set_manifest, set_read_implementation } from '__sveltekit/server';
import { set_private_env, set_public_env } from '../../../../../node_modules/.bun/@sveltejs+kit@2.70.3+3f2a712fabe97041/node_modules/@sveltejs/kit/src/runtime/shared-server.js';
import error from '../shared/error-template.js';

export const options = {
	app_template_contains_nonce: false,
	async: false,
	csp: {"mode":"auto","directives":{"upgrade-insecure-requests":false,"block-all-mixed-content":false},"reportOnly":{"upgrade-insecure-requests":false,"block-all-mixed-content":false}},
	csrf_check_origin: true,
	csrf_trusted_origins: [],
	embedded: false,
	env_public_prefix: 'PUBLIC_',
	env_private_prefix: '',
	hash_routing: false,
	hooks: null, // added lazily, via `get_hooks`
	preload_strategy: "modulepreload",
	root,
	service_worker: false,
	service_worker_options: undefined,
	server_error_boundaries: false,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!doctype html>\n<html lang=\"en\" class=\"dark\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <meta name=\"theme-color\" content=\"#0a0916\" />\n    <link rel=\"icon\" href=\"" + assets + "/favicon.ico\" />\n    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\n    <link\n      href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap\"\n      rel=\"stylesheet\"\n    />\n    <title>Aura — Prove You're Human. Not Who You Are.</title>\n    <meta\n      name=\"description\"\n      content=\"Aura verifies real, unique humans through the people who already know them — no ID uploads, no biometric scans, no central database. Get verified once, use it anywhere.\"\n    />\n    <meta\n      name=\"keywords\"\n      content=\"Aura, BrightID, proof of humanity, decentralized identity, sybil resistance, digital attestations, verified human\"\n    />\n    <meta property=\"og:title\" content=\"Aura — Prove You're Human. Not Who You Are.\" />\n    <meta\n      property=\"og:description\"\n      content=\"Aura verifies real, unique humans through the people who already know them — no ID uploads, no biometric scans, no central database.\"\n    />\n    <meta property=\"og:type\" content=\"website\" />\n    " + head + "\n  </head>\n  <body class=\"antialiased min-h-screen bg-background text-foreground overflow-x-hidden\">\n    <div style=\"display: contents\">" + body + "</div>\n  </body>\n</html>\n",
		error
	},
	version_hash: "5peoxr"
};

export async function get_hooks() {
	let handle;
	let handleFetch;
	let handleError;
	let handleValidationError;
	let init;
	

	let reroute;
	let transport;
	

	return {
		handle,
		handleFetch,
		handleError,
		handleValidationError,
		init,
		reroute,
		transport
	};
}

export { set_assets, set_building, set_manifest, set_prerendering, set_private_env, set_public_env, set_read_implementation };
