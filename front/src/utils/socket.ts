import {Stomp} from "@stomp/stompjs";

console.log("Initiating Stomp configuration")
const client = Stomp.client(import.meta.env.VITE_SOCKET_URL);
await new Promise((resolve, reject) => {
    client.connect({}, () => resolve(true), () => reject())
});

const subscriptionPrefix = "/user/topic/";
const subscriptions = new Set<string>();

export function subscribe(path: string, callback: (data: any) => void) {
    if (subscriptions.has(path)) return;
    subscriptions.add(path);
    client.subscribe(subscriptionPrefix + path, (response) => callback(JSON.parse(response.body)));
}

export function subscribeWithoutUserPrefix(path: string, callback: (data: any) => void) {
    if (subscriptions.has(path)) return;
    subscriptions.add(path);
    client.subscribe(path, (response) => callback(JSON.parse(response.body)));
}

export function unsubscribe(path: string) {
    if (!subscriptions.has(path)) return;
    subscriptions.delete(path);
    client.unsubscribe(subscriptionPrefix + path);
}

export function send(path: string, data: any) {
    client.send("/app/" + path, {}, JSON.stringify(data));
}