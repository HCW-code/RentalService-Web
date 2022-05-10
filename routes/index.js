const{ Router } = require('express');
const {db, admin, FieldValue} = require('../firebase');
const tm1 = require('../lib/date_time');
const emailsend = require("../lib/emailsend");
const ctrl = require('./login');
var passport = require('passport');
var auth = require('../lib/auth');
var msg = require ('dialog')

const router = Router();

const multer = require('multer'); 
const stream = require('stream');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', function (req, res, next) { //웹서버가 작동하면 /list를 보여줘라
    res.redirect('/home'); // /list로 가라
    console.log("redirect")
});

router.get('/home', function (req, res, next) { // /home(리스트)
    var {login, logout, users, admin} = auth.statusUI(req, res);
    res.render('home', {login, logout, users, admin}); // home.ejs 파일로 가라
});

router.get('/login', function (req, res, next) { // 로그인
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/home', //로그인 성공시 홈으로 보냄     
    failureRedirect:'/login' //로그인 실패시 다시 로그인 
}));

router.get('/logout', function (req, res, nex){ //로그아웃
    req.logout();
    req.session.destroy(function(){
        res.redirect('/home');
    });
});

router.get('/join', function (req, res, next) { // 회원가입
    res.render('join');
});


// 수정함
// router.post('/join_save', upload.fields([{name:'store_price', maxCount: 1}, {name: 'store_picture', maxCount: 1}]), async function (req, res, next) {
//     var doc = db.collection('USER').doc();
//     req.body.Email = req.body.firstEmail + "@" + req.body.lastEmail    
//     await doc.set(req.body)
//     await doc.update(
//         { 
//             Password_check: FieldValue.delete(),
//             firstEmail: FieldValue.delete(),
//             lastEmail: FieldValue.delete(),
//             email_sel: FieldValue.delete(),
//         }
//     )

//     var bufferStream = stream.PassThrough();
//     bufferStream.end(Buffer.from(req.files.store_price[0].buffer, "ascii"));
//     let file = admin.storage().bucket().file( req.body.ID + '/'+ 'store_price');
//     bufferStream.pipe(file.createWriteStream({ metadata: { contentType: req.files.store_price[0].mimetype } }))
//         .on("error", (err) => {console.log(err);})
//     .on("finish", () => {console.log(req.files.store_price[0].originalname + " finish");});    

//     bufferStream = stream.PassThrough();
//     bufferStream.end(Buffer.from(req.files.store_picture[0].buffer, "ascii"));
//     file = admin.storage().bucket().file( req.body.ID + '/'+ 'store_picture');
//     bufferStream.pipe(file.createWriteStream({ metadata: { contentType: req.files.store_picture[0].mimetype } }))
//         .on("error", (err) => {console.log(err);})
//     .on("finish", () => {console.log(req.files.store_picture[0].originalname + " finish");});    

//     res.send(
//         "<script>alert('회원가입 신청 완료되었습니다.!! 승인 완료 시 해당 이메일로 승인 메일이 발송됩니다.');location.href='/login';</" +
//         "script>"
//     );
    
// })

// 두 번째 수정함

router.post('/join_save', upload.fields([{name:'store_price', maxCount: 1}, {name: 'store_picture', maxCount: 1}]), async function (req, res, next) {
    const {p_info1, p_info2, p_info3, p_info4, p_info5, p_info6 } = req.body
    price_info = {p_info1, p_info2, p_info3, p_info4, p_info5, p_info6}
    var searchKeywords = new Array();

    for(var i = 0; i < req.body.Name.length; i++){
        searchKeywords[i] = req.body.Name.substr(0, i+1);
    }

    await db.collection('USER').add({ ID: req.body.ID, Password: req.body.Password, Name: req.body.Name, 
        Email: req.body.firstEmail + "@" + req.body.lastEmail, store_name: req.body.store_name, searchKeywords,
        store_address: req.body.store_address, store_number: req.body.store_number, main_number: req.body.main_number, price_info
    })

    var bufferStream = stream.PassThrough();
    bufferStream.end(Buffer.from(req.files.store_price[0].buffer, "ascii"));
    let file = admin.storage().bucket().file( req.body.ID + '/'+ 'store_price');
    bufferStream.pipe(file.createWriteStream({ metadata: { contentType: req.files.store_price[0].mimetype } }))
        .on("error", (err) => {console.log(err);})
    .on("finish", () => {console.log(req.files.store_price[0].originalname + " finish");});    

    bufferStream = stream.PassThrough();
    bufferStream.end(Buffer.from(req.files.store_picture[0].buffer, "ascii"));
    file = admin.storage().bucket().file( req.body.ID + '/'+ 'store_picture');
    bufferStream.pipe(file.createWriteStream({ metadata: { contentType: req.files.store_picture[0].mimetype } }))
        .on("error", (err) => {console.log(err);})
    .on("finish", () => {console.log(req.files.store_picture[0].originalname + " finish");});    

    res.send(
        "<script>alert('회원가입 신청 완료되었습니다.!! 승인 완료 시 해당 이메일로 승인 메일이 발송됩니다.');location.href='/login';</" +
        "script>"
    );
    
})

router.get('/find_account', function (req, res, next) { // 아이디/비밀번호 찾기
    res.render('find_account');
});

router.get('/announcement', async function(req, res, next) {//공지사항 게시판
   
        const querySnapshot = await db.collection('web_anncmnt').get();

        const documents = querySnapshot.docs.map(doc => ({
            id:doc.id,
        ...doc.data()

        }))
        result = documents.sort((a, b) => a.date.toLowerCase() > b.date.toLowerCase() ? -1 : 1);
        currentpage = req.query.currentpage;

        res.render('announcement', {result, currentpage});
    
});

router.get('/announcement_detail', async function(req, res, next) {//공지사항 상세
    id = req.query.id;
    title = req.query.title;
    content = req.query.content;
    console.log(title);
    console.log(id);

    res.render('announcement_detail', {title, content, id});
});

router.post('/new-anncmnt', async (req, res) => {//공지사항 작성 후 저장
    const querySnapshot = await db.collection('web_anncmnt').get()
    const documents = querySnapshot.docs.map(doc => ({ 
        ...doc.data()
    }))

    const { title, cont } = req.body

    await db.collection('web_anncmnt').add({
        title,
        cont,
        num: documents.length+1,
        date: tm1.timestamp()
    })
    currentpage =1;
    
    res.redirect('/announcement?currentpage=1')
    
    // res.send('new anncmnt created')
})

router.get('/new_anncmnt', async function(req, res, next) {//공지사항 작성 폼으로 이동

    res.render('new_anncmnt');
});

router.get("/delete-anncmnt/:id", async(req, res) => {//공지사항 삭제
    await db.collection('web_anncmnt').doc(req.params.id).delete()
    res.redirect('/announcement?currentpage=1')
});

router.get("/edit_anncmnt", async(req, res) => {//공지사항 수정 폼으로 이동
    id = req.query.id;
    
    // res.send('edit anncmnt')

    res.render('edit_anncmnt', {id});
})

router.post('/update-anncmnt/:id', async(req, res) => {//공지사항 수정후 저장
    const {id} = req.params

    await db.collection('web_anncmnt').doc(id).update(req.body)

    res.redirect('/announcement?currentpage=1')
})

router.get('/register_list', async function(req, res, next) {//회원가입 신청 게시판
    const querySnapshot = await db.collection('USER').get();

    const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()

    }))
    result = documents;
    currentpage = req.query.currentpage;
    res.render('register_list', {result, currentpage});
});

// 수정함
router.get('/register_list_detail', async function(req, res, next) {//회원가입 신청 상세 정보
    // console.log(req.query.id)
    const querySnapshot = await db.collection('USER').doc(req.query.id).get()
    var result = querySnapshot.data()
    console.log('확인')
    res.render('register_list_detail', {result, id: req.query.id});
});

// 수정함
router.get("/user-deny", async(req, res) => {//회원가입 거부
    var querySnapshot = await db.collection('USER').doc(req.query.id).get()
    var result = querySnapshot.data()
    emailsend.sendmail(allow = 0, toEmail = result.Email).catch(console.error);

    await admin.storage().bucket().deleteFiles({prefix: result.ID + '/'})    
    await db.collection('USER').doc(req.query.id).delete()
    
    res.redirect('/register_list?currentpage=1')
});

// 수정함

router.get("/user-allow", async(req, res) => {//회원가입 승인 후 가격 수정 칸으로 이동
    var querySnapshot = await db.collection('USER').doc(req.query.id).get()
    var result = querySnapshot.data()
    emailsend.sendmail(allow = 1, toEmail = result.Email).catch(console.error);

    await db.collection('USER_allow').add(result);
    await db.collection('USER').doc(req.query.id).delete()

    res.redirect('/register_list?currentpage=1')
});

router.post('/new-information_change/:users', async (req, res) => {//매장정보 변경 신청서 저장
    const querySnapshot = await db.collection('web_request').get()
    const documents = querySnapshot.docs.map(doc => ({ 
        ...doc.data()
    }))

    const { title, cont } = req.body
    console.log(users)
    console.log(users)
    console.log(users)
    console.log(users)
    console.log(users)


    await db.collection('web_request').add({
        ID: users,
        title,
        cont,
        num: documents.length+1,
        date: await tm1.timestamp()
    })
    
    res.redirect('/')
    
    // res.send('new anncmnt created')
})

router.get('/information_change', async function(req, res, next) {//매장정보 변경 신청 폼으로 이동
    var {login, logout, users, admin} = auth.statusUI(req, res);

    if (users != null){
    res.render('information_change', {login, logout, users, admin});
} else {
    msg.info("회원가입/로그인 후 이용하세요");
     res.redirect('/home'); 
}
});

router.get('/request_list', async function(req, res, next) {//매장정보 변경 신청 게시판
    const querySnapshot = await db.collection('web_request').get();

    const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()

    }))
    result = documents.sort((a, b) => a.date.toLowerCase() > b.date.toLowerCase() ? -1 : 1);
    currentpage = req.query.currentpage;
    console.log(documents);
    console.log(typeof(documents));
    console.log(documents[0].title);
    console.log(currentpage);
    
    res.render('request_list', {result, currentpage});
});

// 수정함
router.get('/request_list_detail', async function(req, res, next) {//매장정보 변경 신청 상세 정보
    const querySnapshot = await db.collection('web_request').doc(req.query.id).get()
    var result = querySnapshot.data()
    res.render('request_list_detail', {result, id: req.query.id});
});

// 수정함
router.get("/information_change-deny", async(req, res) => {//정보변경 거부 => 정보변경신청서 drop 후 email 발송
    const querySnapshot = await db.collection('USER_allow').where("ID", "==", req.query.ID).get()
    querySnapshot.forEach(doc => { result = doc.data() })
    emailsend.sendmail(allow = 2, toEmail = result.Email).catch(console.error);
    await db.collection('web_request').doc(req.query.id).delete()
    res.redirect('/request_list?currentpage=1')
});

// 수정함
router.get("/information_edit", async(req, res) => {//승인 누를시 정보 수정칸 나옴 => 매장정보 수정란
    querySnapshot = await db.collection('USER_allow').where("ID", "==", req.query.ID).get()
    querySnapshot.forEach(doc => { user = doc.data() })
    querySnapshot = await db.collection('web_request').doc(req.query.id).get()
    var request = querySnapshot.data()
    res.render('information_edit', {user, request});
})

// 수정함
router.post('/information_update', async(req, res) => {//매장정보 수정후 저장 => 정보변경신청서 drop 후 email 발송
    const {p_info1, p_info2, p_info3, p_info4, p_info5, p_info6 } = req.body
    price_info = {p_info1, p_info2, p_info3, p_info4, p_info5, p_info6}    
    querySnapshot = await db.collection('USER_allow').where("ID", "==", req.body.ID).get()
    querySnapshot.forEach(doc => { id = doc.id, email = doc.data().Email })

    await db.collection('USER_allow').doc(id).update({ 
        store_name: req.body.store_name,
        store_address: req.body.store_address, 
        store_number: req.body.store_number, 
        main_number: req.body.main_number, 
        price_info: price_info
    })

    emailsend.sendmail(allow = 3, toEmail = email).catch(console.error); 

    querySnapshot = await db.collection('web_request').where("title", "==", req.body.title).get()
    querySnapshot.forEach(doc => { id = doc.id })
    await db.collection('web_request').doc(id).delete()

    res.redirect('/request_list?currentpage=1')
})

module.exports = router;