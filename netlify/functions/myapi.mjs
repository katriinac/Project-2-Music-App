
export default async function(request) {
    const apiKey = process.env.API_KEY;

    const params = new URL(request.url).searchParams;
    const method = params.get("method");

    if (!apiKey) {
        return new Response(JSON.stringify({ error: "API key is not configured" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    if (!method) {
        return new Response(JSON.stringify({ error: "Missing method" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    const url = new URL("https://ws.audioscrobbler.com/2.0/");

    url.searchParams.set("method", method);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("format", "json");

    for (const [key, value] of params.entries()) {
        if (key !== "method") {
            url.searchParams.set(key, value);
        }
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Last.fm request failed" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
