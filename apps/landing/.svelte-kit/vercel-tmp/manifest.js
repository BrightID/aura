export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.ico"]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.BSiuD1pr.js",app:"_app/immutable/entry/app.Dhhqy4D-.js",imports:["_app/immutable/entry/start.BSiuD1pr.js","_app/immutable/chunks/DzhGao3J.js","_app/immutable/chunks/BbNqdxLi.js","_app/immutable/chunks/BIIcupYV.js","_app/immutable/entry/app.Dhhqy4D-.js","_app/immutable/chunks/CFXhlWN6.js","_app/immutable/chunks/DzhGao3J.js","_app/immutable/chunks/CH7wH_1E.js","_app/immutable/chunks/CMhNVJe4.js","_app/immutable/chunks/BIIcupYV.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
