const admin = require('firebase-admin');
const { throwHttpError } = require('./_errors');

const parseServiceAccount = () => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        return JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    }

    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        return {
            projectId: process.env.FIREBASE_PROJECT_ID || 'speed-4-ever',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        };
    }

    return null;
}

const getFirebaseAdmin = () => {
    if (!admin.apps.length) {
        const serviceAccount = parseServiceAccount();
        if (!serviceAccount && process.env.VERCEL) {
            throwHttpError('Firebase Admin credentials are not configured.', 503);
        }

        admin.initializeApp(serviceAccount ? {
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id || serviceAccount.projectId || process.env.FIREBASE_PROJECT_ID || 'speed-4-ever'
        } : {
            projectId: process.env.FIREBASE_PROJECT_ID || 'speed-4-ever'
        });
    }

    return {
        auth: admin.auth(),
        db: admin.firestore(),
        FieldValue: admin.firestore.FieldValue
    };
}

module.exports = { getFirebaseAdmin };
