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
            //'API_URL': 'http://cigna.localhost:8080/'
            'API_URL': '/'
        })
        .constant('MESSAGES', {
        })
        .constant('PAYMENT_INFO', {
            'paymentUrl':'https://psipay.bangkokbank.com/b2c/eng/dPayment/payComp.jsp',
            //'paymentUrl':'http://cigna.localhost:8080/payment.php',
            'merchantId':'1203',
            'currCode':'764',
            //'cvv2Url':'https://ipay.bangkokbank.com/b2c/eng/payment/vm_howto.html',
            'cvv2Url':'https://psipay.bangkokbank.com/b2c/eng/payment/vm_howto.html',
            //'successUrl':'http://bhanumat.16mb.com/#/insurance/thankyou',
            //'failUrl':'http://bhanumat.16mb.com/#/insurance/payment',
            //'cancelUrl':'http://bhanumat.16mb.com/#/insurance/payment',
             'successUrl':'http://localhost:3000/#/insurance/thankyou',
            'failUrl':'http://localhost:3000/#/insurance/payment',
            'cancelUrl':'http://localhost:3000/#/insurance/payment',
            'payType':'N',
            'lang':'T',
            'remark':'-',
            'cards': {
                VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
                MasterCard: /^5[1-5][0-9]{14}$/,
                //amex: /^3[47][0-9]{13}$/,
                //diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
                //discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
                JCB: /^(?:2131|1800|35\d{3})\d{11}$/
            }
        });


})();
