const{ Router } = require('express');
const {db} = require('../firebase');

const router = Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/announcement', async function(req, res, next) {
        const querySnapshot = await db.collection('web_anncmnt').get()

        const documents = querySnapshot.docs.map(doc => ({
        ...doc.data()

        }))
        result = documents;

        console.log(documents);
        console.log(typeof(documents));
        console.log(documents[0].title);
        res.render('announcement', result);


});

