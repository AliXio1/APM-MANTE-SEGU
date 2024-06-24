import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth,signInWithEmailAndPassword, updateEmail, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Users {
  Cargo: string,
  email: string,
  id?: string,
  name: string,
  password: string,
  isAdmin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  login = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  constructor() {
    // Escuchar cambios en la colección 'incidents'
    this.listenForIncidents();
  }

  // Método para escuchar cambios en la colección 'incidents'
  listenForIncidents() {
    this.firestore.collection('incidents').snapshotChanges().subscribe(changes => {
      // Actualizar la interfaz de usuario con los nuevos incidentes
      console.log('Nuevos incidentes:', changes);
      // Aquí puedes agregar la lógica para actualizar la UI o el estado del componente
    });
  }

  // ===== Enviar email para restablecer contraseña ==========
  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  // ========================= Base de Datos ==================

  // ==== Setear un documento ====
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  // Método para obtener un documento
  async getDocument(path: string): Promise<any> {
    try {
      const docSnap = await this.firestore.doc(path).ref.get();
      return docSnap.exists ? { id: docSnap.id, ...(docSnap.data() as object) } : null;
    } catch (error) {
      throw new Error(`Error getting document: ${error.message}`);
    }
  }

  // ==== Obtener usuarios con la estructura especificada ====
  async getUsersL(): Promise<Users[]> {
    const snapshot = await getDocs(collection(getFirestore(), 'usersAdmin'));
    return snapshot.docs.map(doc => doc.data() as Users);
  }

  // ==== Obtener un usuario por email ====
  async getUserByEmail(email: string): Promise<Users | undefined> {
    const q = query(collection(getFirestore(), 'usersAdmin'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? querySnapshot.docs[0].data() as Users : undefined;
  }

  // ==== Actualizar un usuario ====
  async updateUser(user: Users): Promise<void> {
    const userRef = doc(getFirestore(), `usersAdmin/${user.email}`);
    await setDoc(userRef, user, { merge: true });
  }

  // Nuevo método para generar un UID
  generateUID(): string {
    return this.firestore.createId();
  }

  // Nuevo método para guardar incidentes
  async saveIncident(incident: any) {
    const incidentRef = doc(collection(getFirestore(), 'incidents'));
    return setDoc(incidentRef, incident);
  }

  // Método para actualizar un documento
  async updateDocument(path: string, data: any): Promise<void> {
    try {
      await this.firestore.doc(path).update(data);
    } catch (error) {
      throw new Error(`Error updating document: ${error.message}`);
    }
  }

  // Método para obtener múltiples documentos (por ejemplo, incidentes)
  async getIncidents(): Promise<any[]> {
    try {
      const snapshot = await this.firestore.collection('incidents').get().toPromise();
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) }));
    } catch (error) {
      throw new Error(`Error getting incidents: ${error.message}`);
    }
  }

  async getIncidentByUid(uid: string): Promise<any | undefined> {
    const docRef = doc(getFirestore(), 'incidents', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : undefined;
  }

  async getIncidentsByTypeAndCargo(types: string | string[]): Promise<any[]> {
    // Si se pasa un solo tipo, lo convertimos en un array de un solo elemento
    if (!Array.isArray(types)) {
        types = [types];
    }

    const q = query(collection(getFirestore(), 'incidents'), where('type','in', types));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getCurrentUser(): Promise<Users | null> {
    const currentUser = await this.login.currentUser;
    if (currentUser) {
      return this.getUserByEmail(currentUser.email);
    }
    return null;
  }
}
