;(function() {


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
      'PAYMENT_GATEWAY_URL':'https://psipay.bangkokbank.com/b2c/eng/payment/payForm.jsp',
      'PAYMENT_SUCCESS_URL':'/payment/success',
      'PAYMENT_FAIL_URL':'/payment/fail',
      'PAYMENT_CANCEL_URL':'/payment/cancel'
    })
    .constant('MESSAGES', {
      '001':'รหัสโปรโมชั่นไม่ถูกต้อง/หมดอายุ กรุณาตรวจสอบรายละเอียดข้อมูลที่กรอก',
      '002':'xxxxxxxx',
      '003':'aaaaaa',
      'promotion_reached_max_usage':'ขออภัย สิทธิ์โปรโมชั่นครบตามที่บริษัทฯ กำหนดแล้ว ท่านสามารถตรวจสอบโปรโมชั่นอื่นได้ที่ <a href=\"/our-plans/travel-insurance\" target=\"_blank\">โปรโมชั่นประกันการเดินทาง</a>'
    });



})();
