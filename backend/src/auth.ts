import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();

// --- Password Hashing with PBKDF2 (Web Crypto API) ---

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial, 256
    );
    const hashArray = new Uint8Array(derivedBits);
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [saltHex, hashHex] = stored.split(':');
    if (!saltHex || !hashHex) return false;
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial, 256
    );
    const hashArray = new Uint8Array(derivedBits);
    const computedHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
    return computedHex === hashHex;
}

// --- JWT ---

function getSecret(jwtSecret: string) {
    return encoder.encode(jwtSecret);
}

export async function createToken(
    payload: { id: number; email: string; name: string; role: string },
    jwtSecret: string
): Promise<string> {
    return new SignJWT(payload as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .setIssuedAt()
        .sign(getSecret(jwtSecret));
}

export async function verifyToken(
    token: string,
    jwtSecret: string
): Promise<{ id: number; email: string; name: string; role: string } | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret(jwtSecret));
        return payload as unknown as { id: number; email: string; name: string; role: string };
    } catch {
        return null;
    }
}
