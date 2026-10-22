import { createContext, useContext, useState, ReactNode } from "react";

type AuthState = {
    user: string | null
    signIn: (username: string) => void
    signOut: () => void
}

const AuthContext = createContext<AuthState>({
    user: null,
    signIn: () => {},
    signOut: () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<string | null>(null)

    return (
        <AuthContext.Provider
            value={{ user, signIn: setUser, signOut: () => setUser(null) }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)