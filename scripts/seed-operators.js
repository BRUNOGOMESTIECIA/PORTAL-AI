const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

const app = initializeApp({
  projectId: 'instapasso' 
});

const db = getFirestore(app);

async function seed() {
  console.log('Seeding InstaPasso DB...');
  const emails = ['bruno@tiecia.com.br', 'admin@tiecia.com.br', 'test@tiecia.com.br'];

  for (const email of emails) {
    const docRef = db.collection('operators').doc(email.replace('@', '_'));
    await docRef.set({
      email: email,
      fullName: 'Operador ' + email.split('@')[0],
      role: 'Administrador',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });
    console.log(`Added operator: ${email}`);
  }
  
  const domainRef = db.collection('domains').doc('tiecia-domain');
  await domainRef.set({
    companyName: 'TIECIA',
    domainName: '@tiecia.com.br',
    status: 'ACTIVE',
    allowedPages: ['Portal Cliente', 'Portal Operacional']
  });
  console.log('Added domain @tiecia.com.br');

  console.log('Done!');
}

seed();
