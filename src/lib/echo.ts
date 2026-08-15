import Echo from "laravel-echo";
import Pusher from "pusher-js";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8010/api";

// Pusher-js (the transport Echo's "reverb" broadcaster runs on) expects a
// global to be present rather than taking it as a constructor option.
if (typeof window !== "undefined") {
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

let echoInstance: InstanceType<typeof Echo> | null = null;
let echoToken: string | null = null;

/**
 * Lazily creates (or reuses) a single Echo/Reverb connection authenticated
 * with the current Bearer token. This app has no cookie session (Sanctum
 * token-based, two separate origins — see Socle technique memory), so the
 * default cookie-based channel auth Echo ships with doesn't apply: a
 * custom `authorizer` attaches the token by hand on every subscribe.
 *
 * Returns null when there's no logged-in user yet, or outside the browser.
 */
export function getEcho(): InstanceType<typeof Echo> | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem("auth_token");
  if (!token) return null;

  // Token changed (new login) — the old connection was authorized for a
  // different user, so it can't just be reused.
  if (echoInstance && echoToken !== token) {
    disconnectEcho();
  }

  if (echoInstance) return echoInstance;

  echoToken = token;
  echoInstance = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
    enabledTransports: ["ws", "wss"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pusher-js's
    // ChannelAuthorizationData type isn't exported for us to import here; the
    // shape is whatever the Laravel broadcasting/auth endpoint returns.
    authorizer: (channel: { name: string }) => ({
      authorize(socketId: string, callback: (error: Error | null, data: any) => void) {
        fetch(`${API_BASE_URL}/broadcasting/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: new URLSearchParams({ socket_id: socketId, channel_name: channel.name }),
        })
          .then((res) => (res.ok ? res.json() : Promise.reject(res)))
          .then((data) => callback(null, data))
          .catch((error) => callback(error instanceof Error ? error : new Error(String(error)), null));
      },
    }),
  });

  return echoInstance;
}

export function disconnectEcho(): void {
  echoInstance?.disconnect();
  echoInstance = null;
  echoToken = null;
}
