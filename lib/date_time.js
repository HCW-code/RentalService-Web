module.exports = {
    timestamp: function() {       // DATE 객체
        var NOW_DATE = new Date(); 
    
        // UTC 시간 계산
        const UTC = NOW_DATE.getTime() + (NOW_DATE.getTimezoneOffset() * 60 * 1000); 
    
        // UTC to KST (UTC + 9시간)
        const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
        const KR_DATE = new Date(UTC + (KR_TIME_DIFF));    		
    
        // 개별 데이터 확인 실시
        var YYYY = KR_DATE.getFullYear(); // 연 (4자리)    		
        var MM = ("00"+(KR_DATE.getMonth()+1)).slice(-2); // 월 (2자리)
        var DD = ("00"+KR_DATE.getDate()).slice(-2); // 일 (2자리)
    
        var HH24 = ("00"+KR_DATE.getHours()).slice(-2); // 시간 (24시간 기준, 2자리)
        var MI = ("00"+KR_DATE.getMinutes()).slice(-2); // 분 (2자리)
        var SS = ("00"+KR_DATE.getSeconds()).slice(-2); // 초 (2자리)    		
    
        // 리턴값 데이터 포맷 실시
        var return_format = YYYY + "-" + MM + "-" + DD + " " + HH24 + ":" + MI + ":" + SS;    		
        
        return return_format;
    }    
};