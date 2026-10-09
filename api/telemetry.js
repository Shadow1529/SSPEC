// External telemetry and IP Geolocation API handlers
export async function fetchTargetGeolocation() {
    try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("API Limit");
        return await response.json();
    } catch (err) {
        try {
            const simpleRes = await fetch("https://api.ipify.org?format=json");
            const simpleData = await simpleRes.json();
            return { ip: simpleData.ip };
        } catch (e) {
            return null;
        }
    }
}