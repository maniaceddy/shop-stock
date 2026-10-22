import * as Crypto from 'expo-crypto'
import { db } from './database'

async function hashPassword(password: string, salt: string) {
    return Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        salt + password
    )
}

export function hasUser(): boolean {
    const row = db.getFirstSync<{ c: number }>('SELECT COUNT(*) AS c FROM users')
    return (row?.c ?? 0) > 0
}

export async function createUser(username: string, password: string) {
    const salt = Crypto.randomUUID()
    const passwordHash = await hashPassword(password, salt)
    db.runSync(
        'INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)',
        [username, passwordHash, salt]
    )
}

export async function checkLogin(username:string, password: string): Promise<boolean> {
    const user = db.getFirstSync<{ password_hash: string; salt: string }> (
        'SELECT password_hash, salt FROM users WHERE username = ?',
        [username]
    )
    if (!user) return false
    const attempt = await hashPassword(password, user.salt)
    return attempt === user.password_hash
}