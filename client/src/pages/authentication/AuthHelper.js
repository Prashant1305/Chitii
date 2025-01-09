const base64UrlEncode = (arrayBuffer) => {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};

export const generateCodeVerifier = () => {
    const array = new Uint8Array(32); // Generate 32 random bytes
    window.crypto.getRandomValues(array); // Fill array with secure random values
    return base64UrlEncode(array); // Return Base64 URL-safe encoded string
};

export const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data); // Generate SHA-256 hash
    return base64UrlEncode(digest); // Return Base64 URL-safe encoded hash
};