// Definición del tipo de usuario en nuestra app (combinando Auth + Firestore)
export interface AppUser {
    uid: string;
    email: string | null;
    nombre: string | null;
    foto_url: string | null;
    telefono?: string;
    direccion?: string;
    referencia?: string;
    // Firebase Cloud Messaging (Push Notifications)
    fcmToken?: string;
    fcmTokenUpdatedAt?: string;
}
