"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, deleteField, onSnapshot } from "firebase/firestore";
import { auth, db, messaging, getToken, onMessage } from "@/firebase/firebase";
import type { AppUser } from "@/types/user";
import { toast } from "sonner";

// VAPID Key de Firebase Cloud Messaging
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<AppUser | undefined>;
    logout: () => Promise<void>;
    requestNotificationPermission: () => Promise<string | null>;
    fcmToken: string | null;
    notificationPermission: NotificationPermission | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => undefined,
    logout: async () => { },
    requestNotificationPermission: async () => null,
    fcmToken: null,
    notificationPermission: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

    // Registrar el Service Worker para FCM
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/firebase-messaging-sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker de FCM registrado');
                })
                .catch((error) => {
                    console.error('❌ Error registrando Service Worker:', error);
                });
        }
    }, []);

    // Verificar permiso de notificaciones al cargar
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);



    // Función para guardar el FCM Token en Firestore
    const saveFcmToken = async (uid: string, token: string) => {
        try {
            const userRef = doc(db, 'usuarios', uid);
            await updateDoc(userRef, {
                fcmToken: token,
                fcmTokenUpdatedAt: new Date().toISOString()
            });
            console.log('✅ FCM Token guardado en Firestore');
        } catch (error) {
            console.error('❌ Error guardando FCM Token:', error);
        }
    };

    // Función para eliminar el FCM Token de Firestore
    const removeFcmToken = async (uid: string) => {
        try {
            const userRef = doc(db, 'usuarios', uid);
            await updateDoc(userRef, {
                fcmToken: deleteField(),
                fcmTokenUpdatedAt: deleteField()
            });
            console.log('🗑️ FCM Token eliminado de Firestore');
        } catch (error) {
            console.error('❌ Error eliminando FCM Token:', error);
        }
    };

    // Función para solicitar permiso y obtener token FCM
    const requestNotificationPermission = useCallback(async (): Promise<string | null> => {
        if (typeof window === 'undefined' || !('Notification' in window) || !messaging) {
            console.log('Notificaciones no soportadas en este navegador');
            return null;
        }

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                const token = await getToken(messaging, {
                    vapidKey: VAPID_KEY,
                });

                if (token) {
                    console.log('🔔 FCM Token obtenido:', token.substring(0, 20) + '...');
                    setFcmToken(token);

                    // Guardar en Firestore si hay usuario logueado
                    if (user?.uid) {
                        await saveFcmToken(user.uid, token);
                    }

                    return token;
                }
            } else {
                console.log('⚠️ Permiso de notificación denegado');
                toast.warning('Notificaciones desactivadas', {
                    description: 'No recibirás alertas sobre tus pedidos'
                });
            }
        } catch (error) {
            console.error('❌ Error obteniendo token FCM:', error);
        }

        return null;
    }, [user?.uid]);

    const signInWithGoogle = async (): Promise<AppUser | undefined> => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            // Referencia al documento del usuario en Firestore
            const userRef = doc(db, "usuarios", firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            let appUser: AppUser;

            if (!userSnap.exists()) {
                // Usuario nuevo: crear documento
                appUser = {
                    uid: firebaseUser.uid,
                    nombre: firebaseUser.displayName,
                    email: firebaseUser.email,
                    foto_url: firebaseUser.photoURL,
                    telefono: "",
                    direccion: "",
                    referencia: ""
                };
                await setDoc(userRef, appUser);
            } else {
                // Usuario existente: obtener datos
                appUser = userSnap.data() as AppUser;
            }

            setUser(appUser);

            // Después del login, intentar obtener el FCM Token
            // Solo si ya tiene permiso concedido
            if (typeof window !== 'undefined' && 'Notification' in window && messaging) {
                if (Notification.permission === 'granted') {
                    try {
                        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
                        if (token) {
                            setFcmToken(token);
                            await saveFcmToken(firebaseUser.uid, token);
                        }
                    } catch (e) {
                        console.error('Error obteniendo FCM token en login:', e);
                    }
                }
            }

            return appUser;
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Antes de cerrar sesión, eliminar el FCM Token de Firestore
            if (user?.uid) {
                await removeFcmToken(user.uid);
            }

            await signOut(auth);
            setUser(null);
            setFcmToken(null);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    useEffect(() => {
        let unsubscribeUserDoc: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Set cookie for middleware
                document.cookie = "auth_logged_in=true; path=/; max-age=2592000; SameSite=Lax; Secure";

                // Suscribirse a cambios en el documento del usuario en tiempo real
                const userRef = doc(db, "usuarios", firebaseUser.uid);

                unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data() as AppUser;
                        setUser(userData);

                        // Sincronizar token FCM del contexto con el de base de datos
                        if (userData.fcmToken) {
                            setFcmToken(userData.fcmToken);
                        } else {
                            setFcmToken(null);
                        }
                    } else {
                        // Usuario en Auth pero sin doc en Firestore (fallback)
                        const basicUser: AppUser = {
                            uid: firebaseUser.uid,
                            nombre: firebaseUser.displayName,
                            email: firebaseUser.email,
                            foto_url: firebaseUser.photoURL,
                        };
                        setUser(basicUser);
                        setFcmToken(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to user data:", error);
                    setLoading(false);
                });

            } else {
                // Usuario no autenticado
                if (unsubscribeUserDoc) {
                    unsubscribeUserDoc();
                    unsubscribeUserDoc = null;
                }

                document.cookie = "auth_logged_in=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                setUser(null);
                setFcmToken(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeUserDoc) {
                unsubscribeUserDoc();
            }
        };
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signInWithGoogle,
            logout,
            requestNotificationPermission,
            fcmToken,
            notificationPermission
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

