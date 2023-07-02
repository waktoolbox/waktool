export async function gfetch(url: string) {
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + url, {
        credentials: 'include',
        headers: {
            "Access-Control-Allow-Origin": import.meta.env.VITE_BACKEND_URL
        }
    });
    try {
        return await response.json();
    } catch (e) {
        return null;
    }
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

export async function putFetch(url: string, body: any) {
    return (await fetch(import.meta.env.VITE_BACKEND_URL + url, {
        method: "PUT",
        credentials: 'include',
        headers: {
            "Access-Control-Allow-Origin": import.meta.env.VITE_BACKEND_URL,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
    })).json();
}

export async function detch(url: string) {
    return (await fetch(import.meta.env.VITE_BACKEND_URL + url, {
        method: "DELETE",
        credentials: 'include',
        headers: {
            "Access-Control-Allow-Origin": import.meta.env.VITE_BACKEND_URL,
            "Content-Type": "application/json"
        }
    }));
}