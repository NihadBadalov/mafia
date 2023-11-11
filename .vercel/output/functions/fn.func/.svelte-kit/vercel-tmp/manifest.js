export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["audios/beep.mp3","audios/beep2.mp3","audios/gong.mp3","audios/levelup.mp3","audios/night.mp3","audios/voting.mp3","audios/wronganswer.mp3","favicon.png","images/card.png","images/card_citizen.jpg","images/card_doctor.jpg","images/card_don.jpg","images/card_mafia.jpg","images/card_sheriff.jpg"]),
	mimeTypes: {".mp3":"audio/mpeg",".png":"image/png",".jpg":"image/jpeg"},
	_: {
		client: {"start":"_app/immutable/entry/start.5483a483.js","app":"_app/immutable/entry/app.575e44ba.js","imports":["_app/immutable/entry/start.5483a483.js","_app/immutable/chunks/scheduler.5d79c82b.js","_app/immutable/chunks/singletons.a37cd152.js","_app/immutable/chunks/parse.bee59afc.js","_app/immutable/entry/app.575e44ba.js","_app/immutable/chunks/scheduler.5d79c82b.js","_app/immutable/chunks/index.22729539.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js')),
			__memo(() => import('../output/server/nodes/5.js')),
			__memo(() => import('../output/server/nodes/6.js')),
			__memo(() => import('../output/server/nodes/7.js')),
			__memo(() => import('../output/server/nodes/8.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/account",
				pattern: /^\/account\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/api/auth/updateUser",
				pattern: /^\/api\/auth\/updateUser\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/auth/updateUser/_server.ts.js'))
			},
			{
				id: "/api/servers",
				pattern: /^\/api\/servers\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]",
				pattern: /^\/api\/servers\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]/day",
				pattern: /^\/api\/servers\/([^/]+?)\/day\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/day/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]/doctorAbility",
				pattern: /^\/api\/servers\/([^/]+?)\/doctorAbility\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/doctorAbility/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]/gameChat",
				pattern: /^\/api\/servers\/([^/]+?)\/gameChat\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/gameChat/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]/gameEnd",
				pattern: /^\/api\/servers\/([^/]+?)\/gameEnd\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/gameEnd/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]/join",
				pattern: /^\/api\/servers\/([^/]+?)\/join\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/join/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]/leave",
				pattern: /^\/api\/servers\/([^/]+?)\/leave\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/leave/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]/night",
				pattern: /^\/api\/servers\/([^/]+?)\/night\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/night/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]/sheriffAbility",
				pattern: /^\/api\/servers\/([^/]+?)\/sheriffAbility\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/sheriffAbility/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]/start",
				pattern: /^\/api\/servers\/([^/]+?)\/start\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/start/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]/vote",
				pattern: /^\/api\/servers\/([^/]+?)\/vote\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/vote/_server.ts.js'))
			},
			{
				id: "/api/servers/[id]/voting",
				pattern: /^\/api\/servers\/([^/]+?)\/voting\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/servers/_id_/voting/_server.ts.js'))
			},
			{
				id: "/api/user",
				pattern: /^\/api\/user\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/user/_server.ts.js'))
			},
			{
				id: "/api/user/[id]/xp",
				pattern: /^\/api\/user\/([^/]+?)\/xp\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/user/_id_/xp/_server.ts.js'))
			},
			{
				id: "/create/account",
				pattern: /^\/create\/account\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/create/server",
				pattern: /^\/create\/server\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/discordLink",
				pattern: /^\/discordLink\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/discordLink/_server.ts.js'))
			},
			{
				id: "/game/[id]",
				pattern: /^\/game\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/random",
				pattern: /^\/random\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/servers",
				pattern: /^\/servers\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
