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
            //'API_URL': 'https://traveluat.cigna.co.th/CignaPortalWebService/rest/',
            'API_URL': '/',
            'DATE_FORMAT_DISPLAY': 'DD MMMM YYYY',
            'DATE_FORMAT': 'DD/MM/YYYY',
            'WARNING_BEFORE_TIMEOUT': 5
        })
        .constant('MESSAGES', {
            'UNKNOWN_ERROR': 'ขออภัยค่ะ ขณะนี้ระบบขัดข้อง กรุณาทำรายการใหม่ภายหลัง',
            '404': 'ขออภัยค่ะ ขณะนี้ระบบขัดข้อง กรุณาทำรายการใหม่ภายหลัง',
            '500': 'ขออภัยค่ะ ขณะนี้ระบบขัดข้อง กรุณาทำรายการใหม่ภายหลัง'
        })
        .constant('PAYMENT_INFO', {
            'paymentUrl': 'https://psipay.bangkokbank.com/b2c/eng/dPayment/payComp.jsp',
            'merchantId': '1203',
            'currCode': '764',
            'cvv2Url': 'https://psipay.bangkokbank.com/b2c/eng/payment/vm_howto.html',
            'failUrl': 'http://localhost:3000/#/insurance/payment',
			'successUrl': 'http://localhost:3000/#/insurance',
            'cancelUrl': 'http://localhost:3000/#/insurance/payment',
            'payType': 'N',
            'lang': 'T',
            'remark': '-',
            'cards': {
                VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
                Master: /^5[1-5][0-9]{14}$/,
                //amex: /^3[47][0-9]{13}$/,
                //diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
                //discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
                JCB: /^(?:2131|1800|35\d{3})\d{11}$/
            }
        });


})();
