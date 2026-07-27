import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private firebaseApp: admin.app.App;

  onModuleInit() {
    this.initializeFirebaseAdmin();
  }

  private initializeFirebaseAdmin() {
    try {
      if (!admin.apps.length) {
        // Usa o arquivo json criado na raiz da api
        const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
        
        // App principal (Portal IA) com chave mestre para assinar o token e ler o Firestore
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });

        // App secundário (InstaPasso) apenas para verificar o ID Token do usuário (não precisa de chave secreta)
        admin.initializeApp({
          projectId: 'instapasso'
        }, 'instapassoApp');
        
        this.logger.log('Firebase Admin SDK inicializado com sucesso.');
      } else {
        this.firebaseApp = admin.app();
      }
    } catch (error) {
      this.logger.error('Erro ao inicializar o Firebase Admin SDK', error);
      throw error;
    }
  }

  /**
   * Cria um Custom Token validando o usuário no banco de dados.
   * @param uid ID do usuário
   * @returns O token gerado
   */
  async createCustomToken(uid: string): Promise<string> {
    try {
      // Busca o usuário no Firestore para pegar a role/type
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      
      let claims = {};
      if (userDoc.exists) {
        const userData = userDoc.data();
        claims = {
          role: userData?.type || 'client',
          department: userData?.department || '',
        };
      } else {
        // Usuário não cadastrado, criamos um token com role básica
        claims = { role: 'client' };
      }

      // O admin.auth() vai bater no projeto portal-ia-784f6
      const token = await admin.auth().createCustomToken(uid, claims);
      return token;
    } catch (error) {
      this.logger.error(`Erro ao criar Custom Token para o UID: ${uid}`, error);
      throw error;
    }
  }

  /**
   * Verifica um ID Token emitido pelo Firebase Auth do InstaPasso.
   */
  async verifyInstaPassoToken(idToken: string) {
    try {
      // Usa o app secundário para validar a assinatura do InstaPasso
      return await admin.app('instapassoApp').auth().verifyIdToken(idToken);
    } catch (error) {
      this.logger.error('Erro ao verificar ID Token do InstaPasso', error);
      throw error;
    }
  }
}
