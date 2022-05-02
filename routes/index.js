const{ Router } = require('express');
const {db} = require('../firebase');
const tm1 = require('../lib/date_time');
const emailsend = require("../lib/emailsend");
const ctrl = require('./login');
var passport = require('passport');
var auth = require('../lib/auth');
var msg = require ('dialog')

const router = Router();


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

router.post('/join_save', async function (req, res, next) {

    const {
        ID,
        Password,
        Password_check,
        name,
        firstEmail,
        lastEmail,
        store_name,
        store_address,
        store_number,
        main_number,
        store_price,
        store_picture
    } = req.body

        await db
        .collection('USER')
        .add({
            ID: ID,
            Password: Password,
            Name: name,
            Email: firstEmail + "@" + lastEmail,
            store_name: store_name,
            store_address: store_address,
            store_number: store_number,
            main_number: main_number,
            store_price: store_price,
            store_picture: store_picture
        })

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
    console.log(documents);
    console.log(typeof(documents));
    console.log(currentpage);
    res.render('register_list', {result, currentpage});
});

router.get('/register_list_detail', async function(req, res, next) {//회원가입 신청 상세 정보

    id = req.query.id;
    ID = req.query.ID;
    Password = req.query.Password;
    Name = req.query.Name;
    store_picture = req.query.store_picture;
    store_price = req.query.store_price;
    store_name = req.query.store_name;
    console.log(req.query.store_name);
    store_address = req.query.store_address;
    store_number = req.query.store_number;
    main_number = req.query.main_number;
    Email = req.query.Email;
    result=[ID, Password, store_picture, store_price, store_name, store_address, store_number, main_number, Email, id, Name];
    console.log(result);

res.render('register_list_detail', result);
});

router.get("/user-deny", async(req, res) => {//회원가입 거부

    id = req.query.id;
    Email = req.query.Email;

    await db.collection('USER').doc(id).delete()

    emailsend.sendmail(allow = 0, toEmail = Email).catch(console.error);

    res.redirect('/register_list?currentpage=1')
});

router.get("/user-allow", async(req, res) => {//회원가입 승인
    id = req.query.id;

    ID = req.query.ID;
    Password = req.query.Password;
    Name = req.query.Name;
    store_picture = req.query.store_picture;
    store_price = req.query.store_price;
    store_name = req.query.store_name;
    console.log(req.query.store_name);
    store_address = req.query.store_address;
    store_number = req.query.store_number;
    main_number = req.query.main_number;
    Email = req.query.Email;
    console.log(Name)

    console.log(id);

    
    

    currentpage =1;
    emailsend.sendmail(allow = 1, toEmail = Email).catch(console.error);

    console.log("234141111111111111111111111111");
    await db.collection('USER_allow').add({
        ID: ID,
        Password: Password,
        Name: Name,
        store_picture: store_picture,
        store_price: store_price,
        store_name: store_name,
        store_address: store_address,
        store_number: store_number,
        main_number: main_number,
        Email: Email
    })

    await db.collection('USER').doc(id).delete()
   
    res.redirect('register_list?currentpage=1')
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

router.get('/request_list_detail', async function(req, res, next) {//매장정보 변경 신청 상세 정보
ID = req.query.ID;
id = req.query.id;
title = req.query.title;
content = req.query.content;

res.render('request_list_detail', {title, content, id, ID});
});

router.get("/information_change-deny", async(req, res) => {//정보변경 거부

    id = req.query.id;
    ID = req.query.ID;

    var dbdata = await db.collection('USER_allow').where("ID", "==", ID)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            userdata = doc.data()
            console.log(doc.data().ID);
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
    await db.collection('web_request').doc(id).delete()
    emailsend.sendmail(allow = 2, toEmail = userdata.Email).catch(console.error);

    res.redirect('/request_list?currentpage=1')
});

router.get("/information_edit", async(req, res) => {//승인 누를시 정보 수정칸 나옴
    
    ID = req.query.ID;
    var id;
    var send=[];
    //const querySnapshot = await db.collection('web_anncmnt').doc(id).get();

    var dbdata = await db.collection('USER_allow').where("ID", "==", ID)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            id = doc.id,
            userdata = doc.data()
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
    //console.log(documents)


    send[0] = userdata;
    res.render('information_edit', {send, id});
})

router.post('/information_update/:id', async(req, res) => {//공지사항 수정후 저장
    const {id} = req.params

    //emailsend.sendmail(allow = 3, toEmail = userdata.Email).catch(console.error);
    console.log(id)
    await db.collection('USER_allow').doc(id).update(req.body)

    res.redirect('/')
})

module.exports = router;