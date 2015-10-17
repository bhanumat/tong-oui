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
    });



})();
