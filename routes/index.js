const { Router } = require("express");
const {db, admin} = require('../firebase');
const tm1 = require("../lib/date_time");
const emailsend = require("../lib/emailsend");
const ctrl = require("./login");
var passport = require("passport");
var auth = require("../lib/auth");
const crypto = require('crypto');
const checkid = require('./checkId');

const router = Router();

const multer = require('multer'); 
const stream = require('stream');
const { send } = require("process");
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", function (req, res, next) { //웹서버가 작동하면 /list를 보여줘라
  res.redirect("/home"); // /list로 가라
  console.log("redirect");
});


router.get("/home", function (req, res, next) { //home(리스트)
  var { login, logout, users, admin } = auth.statusUI(req, res);
  res.render("home", { login, logout, users, admin }); // home.ejs 파일로 가라
});


router.get("/login", function (req, res, next) { // 로그인
  res.render("login");
});


router.post( "/login", passport.authenticate("local", { // 로그인_post
    successRedirect: "/home", //로그인 성공시 홈으로 보냄
    failureRedirect: "/login", //로그인 실패시 다시 로그인
  })
);


router.get("/logout", function (req, res, nex) { //로그아웃
  req.logout();
  req.session.destroy(function () {
    res.redirect("/home");
  });
});

router.get("/join", function (req, res, next) { // 회원가입
  res.render("join");
});

router.post('/join_save', upload.fields([{name:'store_price', maxCount: 1}, {name: 'store_picture', maxCount: 1}]), async function (req, res, next) {
  const {p_info1, p_info2, p_info3, p_info4, p_info5, p_info6 } = req.body
  price_info = {p_info1, p_info2, p_info3, p_info4, p_info5, p_info6}
  var searchKeywords = new Array();

  for(var i = 0; i < req.body.store_name.length; i++){
      searchKeywords[i] = req.body.store_name.substr(0, i+1);
  }
  
  await db.collection('USER').add({ ID: req.body.ID, Password: req.body.Password, Name: req.body.Name, 
    Email: req.body.firstEmail + "@" + req.body.lastEmail, store_name: req.body.store_name, searchKeywords,
    store_address: req.body.store_address, store_number: req.body.store_number, main_number: req.body.main_number, price_info
})

  var bufferStream = stream.PassThrough();
  bufferStream.end(Buffer.from(req.files.store_price[0].buffer, "ascii"));
  let file = admin.storage().bucket().file( req.body.store_number + '/'+ 'store_price');
  bufferStream.pipe(file.createWriteStream({ metadata: { contentType: req.files.store_price[0].mimetype } }))
      .on("error", (err) => {console.log(err);})
  .on("finish", () => {console.log(req.files.store_price[0].originalname + " finish");});    

  bufferStream = stream.PassThrough();
  bufferStream.end(Buffer.from(req.files.store_picture[0].buffer, "ascii"));
  file = admin.storage().bucket().file( req.body.store_number + '/'+ 'store_picture');
  bufferStream.pipe(file.createWriteStream({ metadata: { contentType: req.files.store_picture[0].mimetype } }))
      .on("error", (err) => {console.log(err);})
  .on("finish", () => {console.log(req.files.store_picture[0].originalname + " finish");});    

  res.send(
      "<script>alert('회원가입 신청 완료되었습니다.!! 승인 완료 시 해당 이메일로 승인 메일이 발송됩니다.');location.href='/login';</" +
      "script>"
  );
});

router.post("/join_save_수정", async function (req, res, next) { //수정중
  const {
    ID_checked,
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
    store_picture,
  } = req.body;
  toID = ID_checked;
  CHID = await checkid.checkedId(toID);
  console.log(CHID);
  if(CHID){
    await db.collection("USER").add({
      ID: ID_checked,
      Password: Password,
      Name: name,
      Email: firstEmail + "@" + lastEmail,
      store_name: store_name,
      store_address: store_address,
      store_number: store_number,
      main_number: main_number,
      store_price: store_price,
      store_picture: store_picture,
    });
    res.send(
      "<script>alert('회원가입 신청 완료되었습니다.!! 승인 완료 시 해당 이메일로 승인 메일이 발송됩니다.');location.href='/login';</" +
        "script>"
    );
  }else {
    res.send(
      "<script>alert('아이디가 중복되었습니다.!! 다른 아이디를 사용하여 주세요');location.href='/join';</" +
        "script>"
    );
  }
  
});


router.post("/check_overlap", async function(req, res, next){ //아이디 중복 체크
  const {id} = req.body;
  toID = id;
  CHID = await checkid.checkedId(toID);
  if(CHID){
    res.send(true);
  }else {
    res.send(false);
  }
});

router.post("/check_all", function(req, res, next){ //회원가입 검증
  const {checkID1, checkPW, comparePW} = req.body;
  console.log("여기닷알"+checkID1+" 1 "+checkPW+" 2 "+comparePW);
  
  if(checkID1 == "false"){
    console.log("아이디");
    res.send("아이디를 다시 확인하여 주세요.");
  } else if(checkPW == "false"){
    console.log("비밀번호를");
    res.send("비밀번호를 다시 확인하여 주세요.");
  } else if(comparePW == "false"){
    console.log("비밀번호 확인");
    res.send("비밀번호 확인을 다시 확인하여 주세요.");
  } else{
    res.send("true");
  }
});

router.get("/find_account", function (req, res, next) { // 아이디/비밀번호 찾기
 
  var { login, logout, users, admin } = auth.statusUI(req, res);
  res.render("find_account", { login, logout, users, admin });
});

router.post("/auth_account", function (req, res, next) {
  const { user_auth_number, authNum } = req.body;

  while (user_auth_number != authNum) {
    if (user_auth_number == authNum) {
      res.send(
        "<script>alert('<%=user_name%>님의 아이디는 <%=user_id%>입니다.');location.href='/login';</" +
          "script>"
      );
    } else {
      res.send(
        "<script>alert('인증번호가 맞지 않습니다. 다시 입력하여 주세요.');location.href='#';</" +
          "script>"
      );
      res.send(
        "<script>user_auth_number = prompt('인증번호 입력', '');location.href='#';</" +
          "script>"
      );
    }
  }
});

router.get("/auth_123", function (req, res, next) {
  const { user_auth_number, authNum, user_name, user_id } = req.query;
  console.log(user_auth_number);
  console.log(authNum);
  console.log(user_name);
  console.log(user_id);

  if (user_auth_number == authNum) {
    res.send(
      "<script>alert('"+user_name +"님의 아이디는 "+user_id +" 입니다.'); location.href='/login';</" +
        "script>"
    );
  } else {
    res.send(
      "<script>alert('인증번호가 맞지 않습니다. 다시 입력하여 주세요.');location.href='find_account';</" +
        "script>"
    );
    res.send(
      "<script>user_auth_number = prompt('인증번호 입력', '');location.href='#';</" +
        "script>"
    );
  }
});

router.post("/find_account", async function (req, res, next) {
  // 아이디/비밀번호 찾기
  var user_name;
  var user_email;
  var user_email2;
  var user_id;
  const { find_name, find_id, find_email } = req.body;

  if (find_name != "") {
    await db
      .collection("USER_allow")
      .where("Email", "==", find_email)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          user_id = doc.data().ID;
          user_name = doc.data().Name;
          user_email = doc.data().Email;
          id = doc.id;
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });

    if (user_email != undefined) {
      if (user_name == find_name) {
        var authNum = await emailsend
          .findaccount_sendmail((toEmail = find_email))
          .catch(console.error);
        res.send(
          "<script>user_auth_number = prompt('인증번호 입력', ''); id = '"+id+"'; user_name = '"+user_name+"'; user_id = '"+user_id+"'; location.href='/auth_123?user_auth_number='+user_auth_number+'&authNum='+"+authNum+"+'&id='+id+'&user_name='+user_name+'&user_id='+user_id;</" +
            "script>"
        );
      } else {
        res.send(
          "<script>alert('사용자 이름이 틀립니다. 다시 한번 확인하여 주세요.');location.href='/find_account';</" +
            "script>"
        );
      }
    } else {
      res.send(
        "<script>alert('사용자 이메일이 틀립니다. 다시 한번 확인하여 주세요.');location.href='/find_account';</" +
          "script>"
      );
    }
  } else {
    await db
      .collection("USER_allow")
      .where("ID", "==", find_id)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          user_id = doc.data().ID;
          user_email2 = doc.data().Email;
        });
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });

    if (user_id != undefined) {
      if (user_email2 == find_email) {
        var pass = '';
        var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz0123456789@#$';
        
        for (let i = 1; i <= 8; i++) {
          var char = Math.floor(Math.random() * str.length + 1);            
          pass += str.charAt(char)
        }

        querySnapshot = await db.collection("USER_allow").where("Email", "==", find_email).get()
        querySnapshot.forEach(doc => { doc_id = doc.id })
        await db.collection('USER_allow').doc(doc_id).update({Password: pass})        
        emailsend.findaccount_sendmail_passwd((toEmail = find_email, pass = pass)).catch(console.error)
        res.send("<script>alert('가입하신 이메일로 비밀번호가 발송되었습니다 !');location.href='/find_account';</" + "script>");

      } else {
        res.send(
          "<script>alert('사용자 이메일이 틀립니다. 다시 한번 확인하여 주세요.');location.href='/find_account';</" +
            "script>"
        );
      }
    } else {
      res.send(
        "<script>alert('사용자 아이디가 틀립니다. 다시 한번 확인하여 주세요.');location.href='/find_account';</" +
          "script>"
      );
    }
  }
});

router.get("/announcement", async function (req, res, next) {  //공지사항 게시판
  console.log("check")
  var { login, logout, users, admin } = auth.statusUI(req, res);

  const querySnapshot = await db.collection("web_anncmnt").get();

  const documents = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  result = documents.sort((a, b) =>
    a.date.toLowerCase() > b.date.toLowerCase() ? -1 : 1
  );
  currentpage = req.query.currentpage;

  res.render("announcement", {
    result,
    currentpage,
    login,
    logout,
    users,
    admin,
  });
});

router.get("/announcement_detail", async function (req, res, next) { //공지사항 상세
  
  var { login, logout, users, admin } = auth.statusUI(req, res);
  id = req.query.id;
  title = req.query.title;
  content = req.query.content;
  console.log(title);
  console.log(id);

  res.render("announcement_detail", {
    title,
    content,
    id,
    login,
    logout,
    users,
    admin,
  });
});

router.post("/new-anncmnt", async (req, res) => { //공지사항 작성 후 저장
  const querySnapshot = await db.collection("web_anncmnt").get();
  const documents = querySnapshot.docs.map((doc) => ({
    ...doc.data(),
  }));

  const { title, cont } = req.body;

  await db.collection("web_anncmnt").add({
    title,
    cont,
    num: documents.length + 1,
    date: tm1.timestamp,
  });
  currentpage = 1;

  res.redirect("/announcement?currentpage=1");

  // res.send('new anncmnt created')
});

router.get("/new_anncmnt", async function (req, res, next) { //공지사항 작성 폼으로 이동
  var { login, logout, users, admin } = auth.statusUI(req, res);
  res.render("new_anncmnt", { login, logout, users, admin });
});

router.get("/delete-anncmnt/:id", async (req, res) => { //공지사항 삭제
  await db.collection("web_anncmnt").doc(req.params.id).delete();
  res.redirect("/announcement?currentpage=1");
});

router.get("/edit_anncmnt", async (req, res) => { //공지사항 수정 폼으로 이동
  
  var { login, logout, users, admin } = auth.statusUI(req, res);
  id = req.query.id;

  // res.send('edit anncmnt')

  res.render("edit_anncmnt", { id, login, logout, users, admin });
});

router.post("/update-anncmnt/:id", async (req, res) => { //공지사항 수정후 저장
  const { id } = req.params;

  await db.collection("web_anncmnt").doc(id).update(req.body);

  res.redirect("/announcement?currentpage=1");
});

router.get("/register_list", async function (req, res, next) { //회원가입 신청 게시판
  var { login, logout, users, admin } = auth.statusUI(req, res);
  const querySnapshot = await db.collection("USER").get();

  const documents = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  result = documents;
  currentpage = req.query.currentpage;
  res.render("register_list", {
    result,
    currentpage,
    login,
    logout,
    users,
    admin,
  });
});

router.get("/register_list_detail", async function (req, res, next) { //회원가입 신청 상세 정보
  var { login, logout, users, admin } = auth.statusUI(req, res);
  const querySnapshot = await db.collection('USER').doc(req.query.id).get()
  var result = querySnapshot.data()
  console.log('확인')
  res.render("register_list_detail", { result, id: req.query.id, login, logout, users, admin });
});

router.get("/user-deny", async(req, res) => { //회원가입 거부
  var querySnapshot = await db.collection('USER').doc(req.query.id).get()
  var result = querySnapshot.data()
  emailsend.sendmail(allow = 0, toEmail = result.Email).catch(console.error);

  await admin.storage().bucket().deleteFiles({prefix: result.store_number + '/'})    
  await db.collection('USER').doc(req.query.id).delete()
  
  res.redirect('/register_list?currentpage=1')
});

router.get("/user-allow", async(req, res) => { //회원가입 승인 후 가격 수정 칸으로 이동
  var querySnapshot = await db.collection('USER').doc(req.query.id).get()
  var result = querySnapshot.data()
  emailsend.sendmail(allow = 1, toEmail = result.Email).catch(console.error);

  querySnapshot = await db.collection('USER_allow').get()
  doc_id =  await (await db.collection('USER_allow').add(result)).id;
  await db.collection('USER_allow').doc(doc_id).update({store_id: querySnapshot.docs.length, 위도: Number(req.query.lat), 경도: Number(req.query.long)})
  await db.collection('USER').doc(req.query.id).delete()

  res.redirect('/register_list?currentpage=1')
});

router.post("/new-information_change/:users", async (req, res) => { //매장정보 변경 신청서 저장
  const querySnapshot = await db.collection("web_request").get();
  const documents = querySnapshot.docs.map((doc) => ({
    ...doc.data(),
  }));

  const { title, cont } = req.body;

  await db.collection('web_request').add({
    ID: users,
    title,
    cont,
    num: documents.length+1,
    date: await tm1.timestamp()
});

  res.redirect("/");
});

router.get("/information_change", async function (req, res, next) { //매장정보 변경 신청 폼으로 이동
  var { login, logout, users, admin } = auth.statusUI(req, res);
  if (users != null) {
    res.render("information_change", { login, logout, users, admin });
  } else {
    res.send(
        "<script>alert('회원가입/로그인 후 이용하세요');location.href='/home';</" +
        "script>"
    );
  }
});

router.get("/request_list", async function (req, res, next) { //매장변경 신청서 목록 게시판
  var { login, logout, users, admin } = auth.statusUI(req, res);
  const querySnapshot = await db.collection("web_request").get();

  const documents = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  result = documents.sort((a, b) =>
    a.date.toLowerCase() > b.date.toLowerCase() ? -1 : 1
  );
  currentpage = req.query.currentpage;

  res.render("request_list", {
    result,
    currentpage,
    login,
    logout,
    users,
    admin,
  });
});

router.get("/request_list_detail", async function (req, res, next) { //매장정보 변경 신청 상세 정보
  var { login, logout, users, admin } = auth.statusUI(req, res);
  const querySnapshot = await db.collection('web_request').doc(req.query.id).get()
    var result = querySnapshot.data()
    res.render('request_list_detail', {result, id: req.query.id, login, logout, users, admin});
});

router.get("/information_change-deny", async(req, res) => {//정보변경 거부 => 정보변경신청서 drop 후 email 발송
  const querySnapshot = await db.collection('USER_allow').where("ID", "==", req.query.ID).get()
  querySnapshot.forEach(doc => { result = doc.data() })  
  emailsend.sendmail(allow = 2, toEmail = result.Email).catch(console.error);
  await db.collection('web_request').doc(req.query.id).delete()
  res.redirect('/request_list?currentpage=1')
});

router.get("/information_edit", async(req, res) => { //승인 누를시 정보 수정칸 나옴 => 매장정보 수정란
  var { login, logout, users, admin } = auth.statusUI(req, res);
  querySnapshot = await db.collection('USER_allow').where("ID", "==", req.query.ID).get()
  querySnapshot.forEach(doc => { user = doc.data() });
  querySnapshot = await db.collection('web_request').doc(req.query.id).get()
  var request = querySnapshot.data()
  console.log("여기222"+user);
  console.log("여기222"+request);
  res.render('information_edit', {user, request});
});

router.post('/information_update', async(req, res) => { //매장정보 수정후 저장 => 정보변경신청서 drop 후 email 발송
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
});

module.exports = router;
