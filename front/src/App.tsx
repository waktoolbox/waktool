import logo from '/logo.png'

import {CompatClient, IMessage, Stomp} from '@stomp/stompjs';
import './App.css'
import {useState} from "react";

function App() {
    const [client, setClient] = useState<CompatClient>({} as CompatClient);

    function connectToSocket() {
        const client = Stomp.client(import.meta.env.VITE_SOCKET_URL);
        setClient(client)
        client.connect({
            "token": localStorage.getItem("token")
        }, () => {
            console.log("Connected");

            client.subscribe("/topic", (message: IMessage) => {
                console.log("RECEIVED TOPIC MESSAGE");
                console.log(message.body);
            })

        }, (error: any) => {
            console.log(error);
        });
    }

    function sendTest() {
        client.send("/app/test", {id: "1234"}, JSON.stringify({
            messageTest: "Hello, STOMP",
            test_underscore: "second"
        }));
    }

    async function getToken() {
        const tokenResponse = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/oauth/token", {
            credentials: 'include',
            headers: {
                "Access-Control-Allow-Origin": import.meta.env.VITE_BACKEND_URL
            }
        })
        const tokenAndExpiration = await tokenResponse.json();
        console.log(tokenAndExpiration);
        localStorage.setItem("token", tokenAndExpiration.token);
    }

    function disconnect() {
        client.disconnect(() => {
            console.log("Disconnected");
        }, {});
    }

    return (
        <>
            <img alt="Waktool's logo" src={logo}/>
            <div>
                <a href={import.meta.env.VITE_DISCORD_OAUTH_URL}>Login with Discord</a>
            </div>

            <div>
                <button onClick={() => connectToSocket()}>Connect to socket</button>
                <button onClick={() => getToken()}>Get token</button>
                <button onClick={() => sendTest()}>Send test</button>
                <button onClick={() => disconnect()}>Disconnect</button>
            </div>
        </>
    )
}

export default App
