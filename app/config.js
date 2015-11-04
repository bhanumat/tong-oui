;(function () {


    /**
     * Place to store API URL or any other constants
     * Usage:
     *
     * Inject CONSTANTS service as a dependency and then use like this:
     * CONSTANTS.API_URL
     */
    angular
        .module('cignaApp')
        .constant('CONSTANTS', {
            'API_URL': '/',
            'PAYMENT_GATEWAY_URL': 'https://psipay.bangkokbank.com/b2c/eng/payment/payForm.jsp',
            'PAYMENT_SUCCESS_URL': '/payment/success',
            'PAYMENT_FAIL_URL': '/payment/fail',
            'PAYMENT_CANCEL_URL': '/payment/cancel'
        })
        .constant('MESSAGES', {
            '001': 'รหัสโปรโมชั่นไม่ถูกต้อง/หมดอายุ กรุณาตรวจสอบรายละเอียดข้อมูลที่กรอก',
            '002': 'xxxxxxxx',
            '003': 'aaaaaa',
            'promotion_reached_max_usage': 'ขออภัย สิทธิ์โปรโมชั่นครบตามที่บริษัทฯ กำหนดแล้ว ท่านสามารถตรวจสอบโปรโมชั่นอื่นได้ที่ <a href=\"/our-plans/travel-insurance\" target=\"_blank\">โปรโมชั่นประกันการเดินทาง</a>',
            'privilege_voluntary': 'เลือกเพิ่ม! จ่ายเพิ่มเพียงเล็กน้อย ได้ความคุ้มครองที่เหนือกว่า <br/><p>- คุ้มครองเที่ยวบินล่าช้า พลาดต่อเที่ยวบิน <br/>- กระเป๋าหรือทรัพย์สินเสียหาย<br/>- รวมไปถึงความรับผิดต่อบุคคลภายนอก</p><br/>ใช่.. ดำเนินการต่อโดยไม่เพิ่มความคุ้มครอง<br/>ไม่.. ข้าพเจ้าต้องการเพิ่มความคุ้มครองเสริม'
        });


})();
