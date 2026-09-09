globalThis.__nitro_main__ = import.meta.url;
import { i as HTTPError, n as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/apple-touch-icon.png": {
		"type": "image/png",
		"etag": "\"6fd0-MCTxBy+Se/zxmegq2i6tIL/I3G8\"",
		"mtime": "2026-09-09T13:22:05.156Z",
		"size": 28624,
		"path": "../public/apple-touch-icon.png"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"b1ec-HUP0rPYP7CHUC6KLjG6fXQNflpk\"",
		"mtime": "2026-09-09T13:22:05.156Z",
		"size": 45548,
		"path": "../public/favicon.ico"
	},
	"/favicon.png": {
		"type": "image/png",
		"etag": "\"b1d6-OVCjwSRCOUnw3JA7q20POHi2CH0\"",
		"mtime": "2026-09-09T13:22:05.156Z",
		"size": 45526,
		"path": "../public/favicon.png"
	},
	"/favicon.svg": {
		"type": "image/svg+xml",
		"etag": "\"70a-8NBKaMqaAT8bY9a7AhmShmJjZCQ\"",
		"mtime": "2026-09-09T13:22:05.155Z",
		"size": 1802,
		"path": "../public/favicon.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-09T13:22:05.156Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/Match-GiB7H7HW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"128ab-Dl4rajzm70BYWEMBTr47mDWL14k\"",
		"mtime": "2026-09-09T13:22:04.516Z",
		"size": 75947,
		"path": "../public/assets/Match-GiB7H7HW.js"
	},
	"/assets/_authenticated-BQ4x4xDE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff3-giA3WzkRRq8a731VoH7783iYwC4\"",
		"mtime": "2026-09-09T13:22:04.516Z",
		"size": 4083,
		"path": "../public/assets/_authenticated-BQ4x4xDE.js"
	},
	"/assets/createLucideIcon-ZzzARakL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a5-9Ju3gVnKgW4nE6OkJq2SxDFjIAI\"",
		"mtime": "2026-09-09T13:22:04.516Z",
		"size": 1189,
		"path": "../public/assets/createLucideIcon-ZzzARakL.js"
	},
	"/assets/flag-B0ZO8RGn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"220-vqDFt9g0rpuzh3iBPdiNZvVSW68\"",
		"mtime": "2026-09-09T13:22:04.517Z",
		"size": 544,
		"path": "../public/assets/flag-B0ZO8RGn.js"
	},
	"/assets/house-DJDUKI-i.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"119-aqgc+Gs+GkJb3PVBGD4//Ui2z/E\"",
		"mtime": "2026-09-09T13:22:04.517Z",
		"size": 281,
		"path": "../public/assets/house-DJDUKI-i.js"
	},
	"/assets/landmark-BosWrrsw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190-I6p5om0mhSAvnvyDzZdQOd7Wmrc\"",
		"mtime": "2026-09-09T13:22:04.517Z",
		"size": 400,
		"path": "../public/assets/landmark-BosWrrsw.js"
	},
	"/assets/log-out-CUhx0aeW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e6-EOG6hc8ayTmRtOp3D2a/5g5jp0w\"",
		"mtime": "2026-09-09T13:22:04.517Z",
		"size": 230,
		"path": "../public/assets/log-out-CUhx0aeW.js"
	},
	"/assets/dashboard-Qj8jMXrK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"61ebd-jvxSt0HVIkXu4WlYfonSN+v1XE0\"",
		"mtime": "2026-09-09T13:22:04.517Z",
		"size": 401085,
		"path": "../public/assets/dashboard-Qj8jMXrK.js"
	},
	"/assets/map-pin-Ck43JfVB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103-vDQ9cmEBAo6q7UezrkNi7TOl2Kg\"",
		"mtime": "2026-09-09T13:22:04.517Z",
		"size": 259,
		"path": "../public/assets/map-pin-Ck43JfVB.js"
	},
	"/assets/member-form-modal-BXXM3Wzd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1484-2e734gndln2gwTmpxRLYuEt/njs\"",
		"mtime": "2026-09-09T13:22:04.518Z",
		"size": 5252,
		"path": "../public/assets/member-form-modal-BXXM3Wzd.js"
	},
	"/assets/login-BLjrUhAA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1600-PQC6q9K9OXwUN57xRXJ1cgt+BzU\"",
		"mtime": "2026-09-09T13:22:04.517Z",
		"size": 5632,
		"path": "../public/assets/login-BLjrUhAA.js"
	},
	"/assets/modal-shell-CAF6MoUI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b2-z6cS/tK198WmyuwkkCal+6e45wo\"",
		"mtime": "2026-09-09T13:22:04.519Z",
		"size": 1970,
		"path": "../public/assets/modal-shell-CAF6MoUI.js"
	},
	"/assets/members-DW0Zi5oq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6b1c-U9VUsa57yJNwW5bB4RJ203deY04\"",
		"mtime": "2026-09-09T13:22:04.518Z",
		"size": 27420,
		"path": "../public/assets/members-DW0Zi5oq.js"
	},
	"/assets/my-dashboard-SJ3unCVv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1975-+9DhXeS4VKrGdN4+0KocSc7FBiE\"",
		"mtime": "2026-09-09T13:22:04.519Z",
		"size": 6517,
		"path": "../public/assets/my-dashboard-SJ3unCVv.js"
	},
	"/assets/routes-8agtpxZV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ad-IWn+Pg8L/jeVKGC51yAiBABPNA8\"",
		"mtime": "2026-09-09T13:22:04.519Z",
		"size": 685,
		"path": "../public/assets/routes-8agtpxZV.js"
	},
	"/assets/puroks-Cet5P2IC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f23-iZ74XhzDrF7dImjz4HdPjelEeeY\"",
		"mtime": "2026-09-09T13:22:04.519Z",
		"size": 3875,
		"path": "../public/assets/puroks-Cet5P2IC.js"
	},
	"/assets/stat-card-rYCysp3z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"371-7qtzMLqDMrV/wDmEMXBN3Gd6QbU\"",
		"mtime": "2026-09-09T13:22:04.519Z",
		"size": 881,
		"path": "../public/assets/stat-card-rYCysp3z.js"
	},
	"/assets/index-CGaInrs6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"40d33-mM0nqdQUmBHfNuW8/KrqUwULuIw\"",
		"mtime": "2026-09-09T13:22:04.515Z",
		"size": 265523,
		"path": "../public/assets/index-CGaInrs6.js"
	},
	"/assets/settings-CJydZtF6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"56e8-yVxdDC+mXx63upqG3HDmERsK6Q8\"",
		"mtime": "2026-09-09T13:22:04.519Z",
		"size": 22248,
		"path": "../public/assets/settings-CJydZtF6.js"
	},
	"/assets/store-DNibmllU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3549b-TIerMKAqltti0VA/J/LZ6aUmNqs\"",
		"mtime": "2026-09-09T13:22:04.520Z",
		"size": 218267,
		"path": "../public/assets/store-DNibmllU.js"
	},
	"/assets/trash-2-BluNX5Ub.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-LrRz12iMchLQ+ssucJsoYPABQc8\"",
		"mtime": "2026-09-09T13:22:04.520Z",
		"size": 328,
		"path": "../public/assets/trash-2-BluNX5Ub.js"
	},
	"/assets/styles-DD62u8IJ.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"17174-Tlcgy1/VYBatUK8Vej+CfKaplzo\"",
		"mtime": "2026-09-09T13:22:04.521Z",
		"size": 94580,
		"path": "../public/assets/styles-DD62u8IJ.css"
	},
	"/assets/useNavigate-DLRn5mwr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f8-AvjnZxsVyz2oeGgGHsyyevqBrFo\"",
		"mtime": "2026-09-09T13:22:04.520Z",
		"size": 248,
		"path": "../public/assets/useNavigate-DLRn5mwr.js"
	},
	"/assets/users-BBzQrH5S.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"17d9-F0pr1uOg3iJuEJ/k6jszeN0/6+E\"",
		"mtime": "2026-09-09T13:22:04.520Z",
		"size": 6105,
		"path": "../public/assets/users-BBzQrH5S.js"
	},
	"/assets/users-DTpY1Ggh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"132-e3nq3loBrz0iQhjTY9ixW3nUyhc\"",
		"mtime": "2026-09-09T13:22:04.520Z",
		"size": 306,
		"path": "../public/assets/users-DTpY1Ggh.js"
	},
	"/assets/xlsx-BivLitlN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"67895-dC+M2iqlwnWyy5rqDFNMq/jNNIE\"",
		"mtime": "2026-09-09T13:22:04.521Z",
		"size": 424085,
		"path": "../public/assets/xlsx-BivLitlN.js"
	},
	"/assets/x-BlJPllsr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-RP478gRaj4C+xrx99oIl4soM3lc\"",
		"mtime": "2026-09-09T13:22:04.520Z",
		"size": 154,
		"path": "../public/assets/x-BlJPllsr.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_9tpc0g = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_9tpc0g
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
