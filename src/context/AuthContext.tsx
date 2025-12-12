"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import type { AppUser } from "@/types/user";

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<AppUser | undefined>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => undefined,
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    const signInWithGoogle = async (): Promise<AppUser | undefined> => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            // Referencia al documento del usuario en Firestore
            const userRef = doc(db, "usuarios", firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Usuario nuevo: crear documento
                const newUser: AppUser = {
                    uid: firebaseUser.uid,
                    nombre: firebaseUser.displayName,
                    email: firebaseUser.email,
                    foto_url: firebaseUser.photoURL,
                    telefono: "",
                    direccion: "",
                    referencia: ""
                };
                await setDoc(userRef, newUser);
                setUser(newUser);
                return newUser;
            } else {
                // Usuario existente: obtener datos
                const existingUser = userSnap.data() as AppUser;
                setUser(existingUser);
                return existingUser;
            }
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Si hay sesión de Firebase, buscar datos en Firestore
                try {
                    const userRef = doc(db, "usuarios", firebaseUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        setUser(userSnap.data() as AppUser);
                    } else {
                        // Caso raro: Auth existe pero no Firestore (podría pasar si falló la creación)
                        // Intentamos recrearlo o usamos datos básicos
                        const basicUser: AppUser = {
                            uid: firebaseUser.uid,
                            nombre: firebaseUser.displayName,
                            email: firebaseUser.email,
                            foto_url: firebaseUser.photoURL,
                        };
                        setUser(basicUser);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
