import logo from '/logo.png'
import './App.css'

function App() {
    return (
        <>
            <img alt="Waktool's logo" src={logo}/>
            <div>
                <a href={import.meta.env.VITE_DISCORD_OAUTH_URL}>Login with Discord</a>
            </div>
        </>
    )
}

export default App
