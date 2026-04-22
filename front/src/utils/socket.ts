import {Client, StompSubscription} from "@stomp/stompjs";

console.log("Initiating Stomp configuration")

function getGuestId() {
    let id = sessionStorage.getItem("guest-id");
    if (!id) {
        id = "guest-" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        sessionStorage.setItem("guest-id", id);
    }
    return id;
}

const client = new Client({
    brokerURL: import.meta.env.VITE_SOCKET_URL,
    connectHeaders: {
        'guest-id': getGuestId()
    },
    heartbeatIncoming: 30000,
    heartbeatOutgoing: 2000,
    reconnectDelay: 2000,
    onConnect: () => {
        console.log("Stomp connected");

        // (Re)subscribe to all desired topics
        for (const {path, callback, hasPrefix} of Array.from(subscriptionsMap.values())) {
            const topic = hasPrefix ? subscriptionPrefix + path : path;
            const stompSub = client.subscribe(topic, (response) => callback(JSON.parse(response.body)));
            activeStompSubscriptions.set(path, stompSub);
        }

        if (!pending) return;
        console.log("Running " + pending.length + " pending functions ")
        for (const pendingFunc of pending) {
            pendingFunc();
        }
        pending = undefined;
    },
    onWebSocketClose: () => {
        console.log("Stomp connection lost");
        activeStompSubscriptions.clear();
        if (!pending) pending = [];
    }
});

type StompPendingFunction = () => void;
let pending: StompPendingFunction[] | undefined = [];

const subscriptionPrefix = "/user/topic/";
const subscriptionsMap = new Map<string, { path: string, callback: (data: any) => void, hasPrefix: boolean }>();
const activeStompSubscriptions = new Map<string, StompSubscription>();

client.activate();

export function subscribe(path: string, callback: (data: any) => void) {
    if (subscriptionsMap.has(path)) return;
    subscriptionsMap.set(path, {path, callback, hasPrefix: true});

    if (client.connected) {
        const sub = client.subscribe(subscriptionPrefix + path, (response) => callback(JSON.parse(response.body)));
        activeStompSubscriptions.set(path, sub);
    }
}

export function subscribeWithoutUserPrefix(path: string, callback: (data: any) => void) {
    if (subscriptionsMap.has(path)) return;
    subscriptionsMap.set(path, {path, callback, hasPrefix: false});

    if (client.connected) {
        const sub = client.subscribe(path, (response) => callback(JSON.parse(response.body)));
        activeStompSubscriptions.set(path, sub);
    }
}

export function unsubscribe(path: string) {
    subscriptionsMap.delete(path);
    const sub = activeStompSubscriptions.get(path);
    if (sub) {
        sub.unsubscribe();
        activeStompSubscriptions.delete(path);
    }
}

export function send(path: string, data: any) {
    const publish = () => client.publish({destination: "/app/" + path, body: JSON.stringify(data)});
    if (client.connected) {
        publish();
    } else {
        if (!pending) pending = [];
        pending.push(publish);
    }
}