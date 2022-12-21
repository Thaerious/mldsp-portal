async function postAppJSON(url, data = {}) {
    console.log("fetch " + url);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    console.log("midway");
    const r = await response.json();  
    console.log("done");
    console.log(r);
    return r;
}

export default postAppJSON;