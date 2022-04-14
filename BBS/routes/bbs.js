const {Router} = require('express');
const {db} = require('../firebase');
const ctrl = require('./login');
var passport = require('passport');
var auth = require('../lib/auth');

const router = Router();
var i = 0

router.get('/', function (req, res, next) { //웹서버가 작동하면 /bbs/list를 보여줘라
    res.redirect('/bbs/home'); // /bbs/list로 가라
    console.log("redirect")
});

router.get('/home', function (req, res, next) { // /bbs/home(리스트)
    var {login, logout, users, admin} = auth.statusUI(req, res);
    res.render('bbs/home', {login, logout, users, admin}); // home.ejs 파일로 가라
});

router.get('/login', function (req, res, next) { // 로그인
    res.render('bbs/login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/bbs/home', //로그인 성공시 홈으로 보냄     
    failureRedirect:'/bbs/login' //로그인 성공시 다시 로그인 
}));

router.get('/logout', function (req, res, nex){ //로그아웃
    req.logout();
    req.session.destroy(function(){
        res.redirect('/bbs/home');
    });
});

router.get('/join', function (req, res, next) { // 회원가입
    res.render('bbs/join');
});

router.post('/join_save', async function (req, res, next) {

    const {
        ID,
        Password,
        Password_check,
        firstEmail,
        lastEmail,
        store_name,
        store_address,
        store_number,
        main_number,
        store_pice,
        store_picture
    } = req.body

        await db
        .collection('USER')
        .add({
            ID: ID,
            Password: Password,
            Email: firstEmail + "@" + lastEmail,
            store_name: store_name,
            store_address: store_address,
            store_number: store_number,
            main_number: main_number,
            store_pice: store_pice,
            store_picture: store_picture
        })

    res.send(
        "<script>alert('회원가입 신청 완료되었습니다.!! 승인 완료 시 해당 이메일로 승인 메일이 발송됩니다.');location.href='/bbs/login';</" +
        "script>"
    );
})

router.get('/find_account', function (req, res, next) { // 아이디/비밀번호 찾기
    res.render('bbs/find_account');
});

router.get('/announcement', async function (req, res, next) { // 공지사항
    const querySnapshot = await db
        .collection('web_anncmnt')
        .get()

    const documents = querySnapshot
        .docs
        .map(doc => ({
            ...doc.data()

        }))
    result = documents;

    console.log(documents);
    console.log(typeof(documents));
    console.log(documents[0].title);
    res.render('bbs/announcement', result);

});

router.get('/read', function (req, res, next) { // /bin/read(게시글 뷰어)
    oracledb.getConnection(dbconfig, function (err, connection) {
        var sql = "";
        if (!req.query.brdno) {
            sql = "SELECT NO, TITLE, WRITER, CONTENT, REGDATE, COUNT FROM BBS WHERE NO=" +
                    req.query.bbs_no;

        } else {
            sql = "SELECT NO, TITLE, WRITER, CONTENT, REGDATE, COUNT FROM BBS WHERE NO=" +
                    req.query.brdno; // 클릭 한 글 번호에 대한 게시판을 찾는다.
        }
        console.log("rows : " + sql);
        connection.execute(sql, function (err, rows) {
            if (err) 
                console.error("err : " + err); //err가 있으면 err 발생
            console.log("rows : " + JSON.stringify(rows)); //err가 없으면 rows를 콘솔창에 띄워라

            res.render('bbs/read', rows);
            connection.release();
        });
    });
});

router.get('/form', function (req, res, next) {
    if (!req.query.brdno) { //글 번호 없을 시 form.ejs로 반환
        res.render('bbs/form', {row: ""});
        return;
    }
    oracledb.getConnection(dbconfig, function (err, connection) {
        var sql = "SELECT NO, TITLE, CONTENT, WRITER, REGDATE" + //글 번호에 맞는 데이터를 찾아 sql에 저장
        " FROM BBS WHERE NO=" + req.query.brdno;
        connection.execute(
            sql,
            function (err, rows) { //sql을 excute해라 에러가 발생하면 err 메시지가 들어간다. 실행이 끝나면 모든 행은 rows로 들어간다.
                if (err) 
                    console.error("err : " + err); //err에 값이 있으면 err 메시지를 보여준다.
                
                res.render('bbs/updateform', rows); // rows를 참조하여 bbs 폴더에 updateform.ejs 파일로 가라 이것을 참조하여 화면에 보여준다.
                connection.release();
            }
        );
    });
});

router.post('/save', function (req, res, next) { //글쓰기
    oracledb.getConnection(dbconfig, function (err, connection) {
        var sql = "";
        if (req.body.brdno) { //글 번호가 있으면 업데이트 (업데이트 활용)
            sql = "UPDATE BBS SET TITLE= '" + req.body.brdtitle + "', CONTENT='" + req.body.brdmemo +
                    "', WRITER='" + req.body.brdwriter + "' WHERE NO=" + req.body.brdno;
        } else { //글 번호가 없으면 추가 (insert 활용)
            sql = "INSERT INTO BBS(NO, TITLE, CONTENT, WRITER, REGDATE, COUNT) VALUES(bbs_seq.nex" +
                    "tval,'" + req.body.brdtitle + "','" + req.body.brdmemo + "','" + req.body.brdwriter +
                    "', sysdate, 0)";
        }
        console.log("sql : " + sql); //콘솔 화면에 출력
        connection.execute(
            sql,
            function (err, rows) { //sql을 excute해라 에러가 발생하면 err 메시지가 들어간다. 실행이 끝나면 모든 행은 rows로 들어간다.
                if (err) 
                    console.error("err : " + err); //err에 값이 있으면 err 메시지를 보여준다.
                
                res.redirect('/bbs/list'); // rows를 참조하여 bbs 폴더에 list.ejs 파일로 가라 이것을 참조하여 화면에 보여준다.
                connection.release();
            }
        );
    });
});

router.get('/search', function (req, res, next) {
    oracledb.getConnection(dbconfig, function (err, connection) {
        var sql = ""
        if (req.query.brdsearchoption == "title") { //serchoption 제목일 때
            console.log(req.query.brdsearch);
            sql = "SELECT NO, TITLE, WRITER, CONTENT, REGDATE" + //제목에 req.query.brdsearch 값이 포함되어 있는 db 출력
            " FROM BBS WHERE title LIKE '%" + req.query.brdsearch + "%' ORDER BY NO ASC";
        } else if (req.query.brdsearchoption == "writer") { //serchoption 작성자일 때
            sql = "SELECT NO, TITLE, WRITER, CONTENT, REGDATE" + //작성자에 req.query.brdsearch 값이 포함되어 있는 db 출력
            " FROM BBS WHERE WRITER LIKE '%" + req.query.brdsearch + "%' ORDER BY NO ASC";
        } else if (req.query.brdsearchoption == "content") { //serchoption 내용일 때
            sql = "SELECT NO, TITLE, WRITER, CONTENT, REGDATE" + //내용에 req.query.brdsearch 값이 포함되어 있는 db 출력
            " FROM BBS WHERE content LIKE '%" + req.query.brdsearch +
                    "%' ORDER BY NO ASC";
        }
        connection.execute(
            sql,
            function (err, rows) { //sql을 excute해라 에러가 발생하면 err 메시지가 들어간다. 실행이 끝나면 모든 행은 rows로 들어간다.
                if (err) 
                    console.error("err : " + err); //err에 값이 있으면 err 메시지를 보여준다.
                res.render('bbs/search', rows); // rows를 참조하여 bbs 폴더에 search.ejs 파일로 가라 이것을 참조하여 화면에 보여준다.
                connection.release();
            }
        );
    });
});

router.get('/delete', function (req, res, next) {
    oracledb.getConnection(dbconfig, function (err, connection) {
        var sql = "DELETE FROM BBS" + //해당 번호 게시글 db에서 삭제
        " WHERE NO=" + req.query.brdno;
        connection.execute(
            sql,
            function (err, rows) { //sql을 excute해라 에러가 발생하면 err 메시지가 들어간다. 실행이 끝나면 모든 행은 rows로 들어간다.
                if (err) 
                    console.error("err : " + err); //err에 값이 있으면 err 메시지를 보여준다.
                
                res.redirect('/bbs/list'); // rows를 참조하여 bbs 폴더에 list.ejs 파일로 가라 이것을 참조하여 화면에 보여준다.
                connection.release();
            }
        );
    });
});

router.get('/wlist', function (req, res, next) { //댓글 목록 기능
    oracledb.getConnection(dbconfig, function (err, connection) {
        console.log("bbs_no: " + req.query.bbs_no);
        var sql = "SELECT NO, BBS_NO, WRITER, CONTENT, REGDATE FROM BBSW" + //BBSW 테이블에서 찾는다.
        " WHERE BBS_NO=" + req.query.bbs_no + //해당 게시글에 써져있는 댓글을 찾는다.
        " ORDER BY NO ASC"; //오름차순으로 정리
        connection.execute(sql, function (err, rows) {
            if (err) 
                console.error("err : " + err);
            console.log("rows: " + sql);
            res.render('bbs/write', rows);
            connection.release();
        });
    });
});

router.post('/write', function (req, res, next) { //댓글 추가 기능, 수정 기능
    oracledb.getConnection(dbconfig, function (err, connection) {
        var sql = "";
        if (req.body.brdno1) { //댓글 번호가 있으면 업데이트 (업데이트 활용)
            sql = "UPDATE BBSW SET WRITER= '" + req.body.brdwriter1 + "', CONTENT='" + req.body.brdmemo1 +
                    "' WHERE NO=" + req.body.brdno1;
        } else { //댓글 번호가 없으면 추가 (insert 활용)
            sql = "INSERT INTO BBSW(NO, BBS_NO, WRITER, CONTENT, REGDATE) VALUES(bbsw_seq.nextval" +
                    ",'" + req.body.bbs_no + "','" + req.body.brdwriter1 + "','" + req.body.brdmemo1 +
                    "', sysdate)";
        }
        console.log("sql : " + sql);
        connection.execute(sql, function (err, rows) {
            if (err) 
                console.error("err : " + err);
            res.redirect("/bbs/wlist?bbs_no=" + req.body.bbs_no); //댓글이 쓰여져 있는 게시글 구별을 위해 req.body.bbs_no값도 같이 보낸다.
            connection.release();
        });
    });
});

router.get('/wform', function (req, res, next) { //댓글  수정 기능
    if (!req.query.brdno1) { //댓글 번호 없을 시 write로 반환
        res.render('bbs/write', {row: ""});
        return;
    }
    oracledb.getConnection(dbconfig, function (err, connection) {
        var sql = "SELECT NO, BBS_NO, WRITER, CONTENT, REGDATE" + //댓글 번호에 맞는 데이터를 찾아 sql에 저장
        " FROM BBSW WHERE NO=" + req.query.brdno1;

        connection.execute(
            sql,
            function (err, rows) { //sql을 excute해라 에러가 발생하면 err 메시지가 들어간다. 실행이 끝나면 모든 행은 rows로 들어간다.
                if (err) 
                    console.error("err : " + err); //err에 값이 있으면 err 메시지를 보여준다.
                res.render('bbs/writeupdate', rows); // rows를 참조하여 bbs 폴더에 updateform.ejs 파일로 가라 이것을 참조하여 화면에 보여준다.
                connection.release();
            }
        );
    });
});

router.get('/wdelete', function (req, res, next) { //댓글 삭제 기능
    oracledb.getConnection(dbconfig, function (err, connection) {
        var sql = "DELETE FROM BBSW" + //해당 번호 댓글 db에서 삭제
        " WHERE NO=" + req.query.brdno1;
        connection.execute(
            sql,
            function (err, rows) { //sql을 excute해라 에러가 발생하면 err 메시지가 들어간다. 실행이 끝나면 모든 행은 rows로 들어간다.
                if (err) 
                    console.error("err : " + err); //err에 값이 있으면 err 메시지를 보여준다.
                
                res.redirect("/bbs/wlist?bbs_no=" + req.query.bbs_no); //댓글이 쓰여져 있는 게시글 구별을 위해 req.body.bbs_no값도 같이 보낸다.
                connection.release();
            }
        );
    });
});

module.exports = router;