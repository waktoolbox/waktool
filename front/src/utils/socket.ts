import {Stomp} from "@stomp/stompjs";

console.log("Initiating Stomp configuration")
const client = Stomp.client(import.meta.env.VITE_SOCKET_URL);
client.heartbeatIncoming = 0;
client.heartbeatOutgoing = 0;
type StompPendingFunction = () => void;
const pending: StompPendingFunction[] = [];

client.onConnect = () => {
    console.log("Running " + pending.length + " pending functions ")
    for (const pendingFunc of pending) {
        pendingFunc();
    }
}
client.connect({},
    () => {
    },
    () => {
    }
)

const subscriptionPrefix = "/user/topic/";
const subscriptions = new Set<string>();

function executeOrSchedule(func: () => void) {
    if (client.connected) {
        func();
        return;
    }
    pending.push(func);
}

export function subscribe(path: string, callback: (data: any) => void) {
    if (subscriptions.has(path)) return;
    subscriptions.add(path);
    executeOrSchedule(() => client.subscribe(subscriptionPrefix + path, (response) => callback(JSON.parse(response.body))));
}

export function subscribeWithoutUserPrefix(path: string, callback: (data: any) => void) {
    if (subscriptions.has(path)) return;
    subscriptions.add(path);
    executeOrSchedule(() => client.subscribe(path, (response) => callback(JSON.parse(response.body))));
}

export function unsubscribe(path: string) {
    if (!subscriptions.has(path)) return;
    subscriptions.delete(path);
    executeOrSchedule(() => client.unsubscribe(subscriptionPrefix + path));
}

export function send(path: string, data: any) {
    executeOrSchedule(() => client.send("/app/" + path, {}, JSON.stringify(data)));
}