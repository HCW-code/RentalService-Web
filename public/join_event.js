/*변수 선언*/
var id = document.querySelector('#ID');

var pw1 = document.querySelector('#password');
var pwMsg = document.querySelector('#alertTxt');
var pwImg1 = document.querySelector('#pswd1_img1');

var pw2 = document.querySelector('#password_check');
var pwImg2 = document.querySelector('#pswd2_img1');
var pwMsgArea = document.querySelector('.int_pass');

var userName = document.querySelector('#name');

var email = document.querySelector('#email');

var mobile = document.querySelector('#mobile');

var error = document.querySelectorAll('.error_next_box');

var Yes_join_btn = document.querySelector('#Yes_join_btn');

var form_action = document.querySelector('.form-signin');

/*이벤트 핸들러 연결*/


id.addEventListener("focusout", checkId);
pw1.addEventListener("focusout", checkPw);
pw2.addEventListener("focusout", comparePw);
userName.addEventListener("focusout", checkName);
Yes_join_btn.addEventListener("click", checkAll);

//dd.addEventListener("focusout", isBirthCompleted);
/*gender.addEventListener("focusout", function() {
    if(gender.value === "성별") {
        error[5].style.display = "block";
    } else {
        error[5].style.display = "none";
    }
})*/
//email.addEventListener("focusout", isEmailCorrect);
//mobile.addEventListener("focusout", checkPhoneNum);





/*콜백 함수*/

function checkId() {
    var idPattern = /[a-zA-Z0-9_-]{5,20}/;
    if(id.value === "") {
        error[0].innerHTML = "필수 정보입니다.";
        error[0].style.display = "block";
        return false;
    } else if(!idPattern.test(id.value)) {
        error[0].innerHTML = "5~20자의 영문 소문자, 숫자와 특수기호(_),(-)만 사용 가능합니다.";
        error[0].style.color = "red";
        error[0].style.display = "block";
        return false;
    } else {        
        $.ajax({
            url : "/check_overlap",
            type : "POST",
            data : {
                "id" : id.value
            },
            success : function (data) {
                if (!data){
                    error[0].innerHTML = "이미 존재하는 ID입니다.";
                    error[0].style.color = "red";
                    error[0].style.display = "block";
                    return false;
                } else {
                    error[0].innerHTML = "사용 가능합니다!";
                    error[0].style.color = "#08A600";
                    error[0].style.display = "block";
                    return true;
                }
            }
        })
        
    }
}

function checkPw() {
    var pwPattern = /[a-zA-Z0-9~!@#$%^&*()_+|<>?:{}]{8,16}/;
    if(pw1.value === "") {
        error[1].innerHTML = "필수 정보입니다.";
        error[1].style.display = "block";
        return false;
    } else if(!pwPattern.test(pw1.value)) {
        error[1].innerHTML = "8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.";
        error[1].style.color = "red";
        pwMsg.innerHTML = "사용불가";
        pwMsgArea.style.paddingRight = "93px";
        error[1].style.display = "block";
        pwMsg.style.display = "block";
        pwMsg.style.color = "red";
        pwImg1.src = "assets/images/m_icon_not_use.png";
        return false;
    } else {
        error[1].style.display = "none";
        pwMsg.innerHTML = "안전";
        pwMsg.style.display = "block";
        pwMsg.style.color = "#03c75a";
        pwImg1.src = "assets/images/m_icon_safe.png";
        return true;
    }
}

function comparePw() {
    if(pw2.value === pw1.value && pw2.value != "") {
        pwImg2.src = "assets/images/m_icon_check_enable.png";
        error[2].style.display = "none";
        return true;
    } else if(pw2.value !== pw1.value) {
        pwImg2.src = "assets/images/m_icon_check_unenable.png";
        error[2].innerHTML = "비밀번호가 일치하지 않습니다.";
        error[2].style.color = "red";
        error[2].style.display = "block";
        return false;
    } 

    if(pw2.value === "") {
        error[2].innerHTML = "필수 정보입니다.";
        error[2].style.color = "red";
        error[2].style.display = "block";
        return false;
    }
}

function checkName() {
    var namePattern = /[a-zA-Z가-힣]/;
    if(userName.value === "") {
        error[3].innerHTML = "필수 정보입니다.";
        error[3].style.color = "red";
        error[3].style.display = "block";
    } else if(!namePattern.test(userName.value) || userName.value.indexOf(" ") > -1) {
        error[3].innerHTML = "한글과 영문 대 소문자를 사용하세요. (특수기호, 공백 사용 불가)";
        error[3].style.color = "red";
        error[3].style.display = "block";
    } else {
        error[3].style.display = "none";
    }
}




function isEmailCorrect() {
    var emailPattern = /[a-z0-9]{2,}@[a-z0-9-]{2,}\.[a-z0-9]{2,}/;

    if(email.value === ""){ 
        error[6].style.display = "none"; 
    } else if(!emailPattern.test(email.value)) {
        error[6].style.display = "block";
    } else {
        error[6].style.display = "none"; 
    }

}

function checkPhoneNum() {
    var isPhoneNum = /([01]{2})([01679]{1})([0-9]{3,4})([0-9]{4})/;

    if(mobile.value === "") {
        error[7].innerHTML = "필수 정보입니다.";
        error[7].style.display = "block";
    } else if(!isPhoneNum.test(mobile.value)) {
        error[7].innerHTML = "형식에 맞지 않는 번호입니다.";
        error[7].style.display = "block";
    } else {
        error[7].style.display = "none";
    }
}

function checkAll() {
    $.ajax({
        url : "/check_all",
        type : "POST",
        data : {
            "checkID" : checkId,
            "checkPW" : checkPw,
            "comparePW" : comparePw
        },

        success : function (data) {
            if (data){
                return true;
            } else {
                alert(data);
                return false;
            }
        }
    })
}


/*
2월 : 윤년에는 29일까지, 평년에는 28일까지.
1,3,5,7, 8,10,12 -> 31일
2,4,6, 9,11 -> 30일

    var days31 = [1, 3, 5, 7, 8, 10, 12];
    var days30 = [4, 6, 9, 11];

    if(mm.value )

var sel = document.getElementById("sel");
var val = sel.options[sel.selectedIndex].value;

var id = document.querySelector('#id');
var pw1 = document.querySelector('#pswd1');
var pw2 = document.querySelector('#pswd2');
var yourName = document.querySelector('#name');
var yy = document.querySelector('#yy');
var mm = document.querySelector('#mm');
var dd = document.querySelector('#dd');
var email = document.querySelector('#email');
var mobile = document.querySelector('#mobile');
var error = document.querySelectorAll('.error_next_box');

var pattern_num = /[0-9]/;
var pattern_spc = /[~!@#$%^&*()_+|<>?:{}]/;


id.onchange = checkId;
pw1.onchange = checkPw;
pw2.onchange = comparePw;
yourName.onchange = checkName;
yy.onchange = checkYear;


function checkId() {
    if(id.value === "") {
        error[0].style.display = "block";
    } else if(id.value.length < 5 || id.value.length > 20){
        error[0].innerHTML = "5~20자의 영문 소문자, 숫자와 특수기호(_),(-)만 사용 가능합니다.";
        error[0].style.display = "block";
    }
}

function checkPw() {
    if(pw1.value === "") {
        error[1].style.display = "block";
    } else if (pw1.value.length < 8 || pw1.value.length > 16) {
        error[1].innerHTML = "8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.";
        error[1].style.display = "block";
    }
}

function comparePw() {
    if(pw2.value === "") {
        error[2].style.display = "block";
    } else if (pw2.value !== pw1.value) {
        error[2].innerHTML = "비밀번호가 일치하지 않습니다.";
        error[2].style.display = "block";
    }
}

function checkName() {
    if( yourName.value.indexOf(" ") >= 0 || pattern_spc.test(yourName.value) || pattern_num.test(yourName.value) ) {
        error[3].innerHTML = "한글과 영문 대 소문자를 사용하세요. (특수기호, 공백 사용 불가)";
        error[3].style.display = "block";
    } else if(yourName.value.length === 0) {
        error[3].style.display = "block";
    } else {
        error[3].style.display = "none";
    }
}

function checkYear() {
    isBirthEntered();
    if(yy.value.length !== 4 || !pattern_num.test(yy.value)) {
        error[4].innerHTML = "태어난 년도 4자리를 정확하게 입력하세요.";
    } else if (parseInt(yy.value) < 1920) {
        error[4].innerHTML = "정말이세요?";
        error[4].style.display = "block";
    }

}

function isBirthEntered() {
    
}

function checkEmail() {
    
}

function checkNumber() {
    
}
*/