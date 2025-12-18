    async function generateSalt() {
        const salt = window.crypto.getRandomValues(new Uint8Array(16)); // 16 bytes for a good salt
        return salt;
    }

    async function deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            passwordBuffer,
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );

        const key = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000, // Number of iterations, higher is more secure but slower
                hash: "SHA-256",
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 }, // Or another suitable algorithm
            true,
            ["encrypt", "decrypt"]
        );
        return key;
    }

    async function hashPassword(password) {
        const salt = await generateSalt();
        const key = await deriveKey(password, salt);

        // Export the derived key as a raw buffer to get the hash
        const hashBuffer = await window.crypto.subtle.exportKey("raw", key);
        
        // Convert the ArrayBuffer to a Base64 string for storage/transmission
        const base64Salt = btoa(String.fromCharCode(...new Uint8Array(salt)));
        const base64Hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

        return { salt: base64Salt, hash: base64Hash };
    }