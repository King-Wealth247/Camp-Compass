module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiClient",
    ()=>ApiClient,
    "apiClient",
    ()=>apiClient
]);
class ApiClient {
    baseUrl;
    token = null;
    constructor(baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'){
        this.baseUrl = baseUrl;
        this.loadToken();
    }
    loadToken() {
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
            this.token = token;
        } catch (error) {
            console.warn('Failed to load token from storage');
        }
    }
    setToken(token) {
        this.token = token;
        try {
            sessionStorage.setItem('auth_token', token);
        } catch (error) {
            console.warn('Failed to save token to storage');
        }
    }
    clearToken() {
        this.token = null;
        try {
            sessionStorage.removeItem('auth_token');
            localStorage.removeItem('auth_token');
        } catch (error) {
            console.warn('Failed to clear token from storage');
        }
    }
    getHeaders(config) {
        const headers = {
            'Content-Type': 'application/json',
            ...config?.headers
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType?.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        if (!response.ok) {
            return {
                error: {
                    error: typeof data === 'object' && data !== null && 'error' in data ? data.error : 'An error occurred',
                    status: response.status,
                    timestamp: new Date().toISOString()
                },
                status: response.status
            };
        }
        return {
            data: data,
            status: response.status
        };
    }
    async request(endpoint, config) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = this.getHeaders(config);
        const fetchConfig = {
            method: config?.method || 'GET',
            headers
        };
        if (config?.body) {
            fetchConfig.body = JSON.stringify(config.body);
        }
        try {
            const controller = new AbortController();
            const timeout = config?.timeout || 30000;
            const timeoutId = setTimeout(()=>controller.abort(), timeout);
            const response = await fetch(url, {
                ...fetchConfig,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return this.handleResponse(response);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    error: {
                        error: 'Request timeout',
                        status: 408
                    },
                    status: 408
                };
            }
            return {
                error: {
                    error: error instanceof Error ? error.message : 'Network error',
                    status: 0,
                    timestamp: new Date().toISOString()
                },
                status: 0
            };
        }
    }
    async get(endpoint, config) {
        return this.request(endpoint, {
            ...config,
            method: 'GET'
        });
    }
    async post(endpoint, body, config) {
        return this.request(endpoint, {
            ...config,
            method: 'POST',
            body
        });
    }
    async put(endpoint, body, config) {
        return this.request(endpoint, {
            ...config,
            method: 'PUT',
            body
        });
    }
    async delete(endpoint, config) {
        return this.request(endpoint, {
            ...config,
            method: 'DELETE'
        });
    }
    async patch(endpoint, body, config) {
        return this.request(endpoint, {
            ...config,
            method: 'PATCH',
            body
        });
    }
}
const apiClient = new ApiClient();
}),
"[project]/src/lib/authService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthService",
    ()=>AuthService,
    "authService",
    ()=>authService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-ssr] (ecmascript)");
;
class AuthService {
    async login(payload) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].post('/api/auth/login', payload);
        if (response.data?.token) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].setToken(response.data.token);
        }
        return response;
    }
    async register(payload) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].post('/api/auth/register', payload);
    }
    async getMe() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].get('/api/auth/me');
    }
    async logout() {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].clearToken();
    }
    getToken() {
        return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
    }
}
const authService = new AuthService();
}),
"[project]/src/app/context/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/authService.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const initAuth = async ()=>{
            const stored = sessionStorage.getItem("cc_user");
            if (stored) {
                const parsedUser = JSON.parse(stored);
                setUser(parsedUser);
                // Try to validate token with backend
                try {
                    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authService"].getMe();
                    if (!response.data) {
                        // Token invalid, clear user
                        logout();
                    }
                } catch (error) {
                    // Token invalid, clear user
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);
    const login = async (email, password)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authService"].login({
                email,
                password
            });
            if (response.data && response.data.user) {
                const userData = response.data.user;
                setUser(userData);
                sessionStorage.setItem("cc_user", JSON.stringify(userData));
                return userData;
            }
            return null;
        } catch (error) {
            console.error("Login error:", error);
            return null;
        }
    };
    const logout = ()=>{
        setUser(null);
        sessionStorage.removeItem("cc_user");
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authService"].logout();
    };
    const changePassword = (newPassword)=>{
        if (!user) return;
        // Note: This would need a backend endpoint for password change
        // For now, just update local state
        const updated = {
            ...user,
            isFirstLogin: false
        };
        setUser(updated);
        sessionStorage.setItem("cc_user", JSON.stringify(updated));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            login,
            logout,
            changePassword
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/context/AuthContext.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0pv9157._.js.map