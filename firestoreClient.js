const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

class FirestoreClient{
    constructor() {
        this.firestore = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    async save(collection, data){
        const docRef = this.firestore.firestore().collection(collection).doc(data.docName);
        await docRef.set(data);
    }

    async getByPath(path) {
        var response = [];
        const docRef = this.firestore.firestore().collection(path);
        const docRefD = docRef.get().then((QuerySnapshot) => {
            QuerySnapshot.forEach(document => {
               response.push(document.data())
            })
            return response;
        })
        response = await docRefD;
        return response;
    }
}

module.exports = new FirestoreClient();