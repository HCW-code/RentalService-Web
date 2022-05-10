require("dotenv").config();

const { initializeApp, applicationDefault }= require("firebase-admin/app")
const { getFirestore } = require("firebase-admin/firestore")

initializeApp({
    credential: applicationDefault(),
    storageBucket: "cstone-3dc2f.appspot.com"
});

const db = getFirestore();
const admin = require("firebase-admin")

module.exports = {
    db, admin
};