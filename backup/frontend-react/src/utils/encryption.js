// utils/encryption.js
function safeB64Encode(uint8Array) {
    let binary = "";
    uint8Array.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeB64Decode(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

export async function generateKeys() {
    const keyPair = await crypto.subtle.generateKey(
        { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true,
        ["encrypt", "decrypt"]
    );

    const publicKey = new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey));
    const privateKey = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey));

    const publicKeyB64 = safeB64Encode(publicKey);
    const privateKeyB64 = safeB64Encode(privateKey);

    localStorage.setItem("publicKey", publicKeyB64);
    localStorage.setItem("privateKey", privateKeyB64);

    return { publicKey: publicKeyB64, privateKey: privateKeyB64 };
}

export async function encryptMessage(plainText, recipientPublicKeyB64) {
    const publicKeyBytes = safeB64Decode(recipientPublicKeyB64);
    const publicKey = await crypto.subtle.importKey(
        "spki",
        publicKeyBytes.buffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"]
    );

    // AES key & IV
    const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt message with AES
    const encryptedTextBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, new TextEncoder().encode(plainText));

    // Encrypt AES key with RSA
    const rawAesKey = new Uint8Array(await crypto.subtle.exportKey("raw", aesKey));
    const encryptedKeyBuffer = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawAesKey);

    return {
        encryptedText: safeB64Encode(new Uint8Array(encryptedTextBuffer)),
        encryptedKey: safeB64Encode(new Uint8Array(encryptedKeyBuffer)),
        iv: safeB64Encode(iv)
    };
}

export async function decryptMessage({ encryptedText, encryptedKey, iv }) {
    const privateKeyB64 = localStorage.getItem("privateKey");
    if (!privateKeyB64) throw new Error("Private key not found");

    const privateKeyBytes = safeB64Decode(privateKeyB64);
    const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        privateKeyBytes.buffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt"]
    );

    try {
        const aesKeyBuffer = await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            safeB64Decode(encryptedKey).buffer
        );

        const aesKey = await crypto.subtle.importKey("raw", aesKeyBuffer, { name: "AES-GCM" }, false, ["decrypt"]);
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: safeB64Decode(iv) },
            aesKey,
            safeB64Decode(encryptedText)
        );

        return new TextDecoder().decode(decryptedBuffer);
    } catch (err) {
        console.error("❌ Decryption failed:", err);
        throw err;
    }
}
