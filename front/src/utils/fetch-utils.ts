export async function gfetch(url: string) {
    return (await fetch(import.meta.env.VITE_BACKEND_URL + url, {
        credentials: 'include',
        headers: {
            "Access-Control-Allow-Origin": import.meta.env.VITE_BACKEND_URL
        }
    })).json();
}

export async function pfetch(url: string, body: any) {
    return (await fetch(import.meta.env.VITE_BACKEND_URL + url, {
        method: "POST",
        credentials: 'include',
        headers: {
            "Access-Control-Allow-Origin": import.meta.env.VITE_BACKEND_URL,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    })).json();
}