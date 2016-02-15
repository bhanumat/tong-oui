(function (angular) {
    'use strict';


    /**
     * @ngdoc overview
     * @name angulartics.google.analytics
     * Enables analytics support for Google Tag Manager (http://google.com/tagmanager)
     */

    angular.module('angulartics.google.tagmanager', ['angulartics'])
        .config(['$analyticsProvider', function ($analyticsProvider) {

            function getParameterByName(name) {
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.hash);
                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            }

            /**
             * Send content views to the dataLayer
             *
             * @param {string} path Required 'content name' (string) describes the content loaded
             */

            $analyticsProvider.registerPageTrack(function (path) {
                var dataLayer = window.dataLayer = window.dataLayer || [];
                dataLayer.push({
                    'event': 'content-view',
                    'content-name': path
                });

                if (path.indexOf("destination") > 9) {
                    dataLayer.push({
                        'event': 'checkout',
                        'ecommerce': {
                            'checkout': {
                                'actionField': {'step': 1, 'option': 'Date Selection'}
                            }
                        }
                    });
                }

                if (path.indexOf("plan") > 9) {
                    dataLayer.push({
                        'event': 'checkout',
                        'ecommerce': {
                            'checkout': {
                                'actionField': {'step': 2, 'option': 'Plan Selection'}
                            }
                        }
                    });
                }

                if (path.indexOf("profile") > 9) {
                    dataLayer.push({
                        'event': 'checkout',
                        'ecommerce': {
                            'checkout': {
                                'actionField': {'step': 3, 'option': 'Personal Information'}
                            }
                        }
                    });
                }

                if (path.indexOf("payment") > 9) {
                    dataLayer.push({
                        'event': 'checkout',
                        'ecommerce': {
                            'checkout': {
                                'actionField': {'step': 4, 'option': 'Payment Information'}
                            }
                        }
                    });
                }

                if (path.indexOf("thankyou") > 9) {
                    var storagePaymentInfo = window.localStorage && angular.fromJson(window.localStorage.getItem('insurance.travel'));
                    var storageTravelInfo = window.localStorage && angular.fromJson(window.localStorage.getItem('insurance.travelData'));
                    var refId = getParameterByName('Ref');
                    if (refId && storageTravelInfo && storageTravelInfo) {
                        //GTM Info
                        var paymentInfo = angular.copy(storagePaymentInfo);
                        var planName = _.result(_.findWhere(storageTravelInfo.campaignList[0].mandatory.rateScaleList, {'rateScale': paymentInfo.mandatory.rateScale.rateScale}), 'description');
                        var price = paymentInfo.premiumAmount / paymentInfo.passengers;
                        var products = [];
                        for (var i = 1; i <= paymentInfo.passengers; i++) {
                            products.push({
                                'name': planName,
                                'id': paymentInfo.mandatory.rateScale.rateScale+'',
                                'price': price+'',
                                'brand': 'CIGNA',
                                'category': 'Travel',
                                'quantity': 1
                            });
                        }

                        dataLayer.push({
                            'ecommerce': {
                                'purchase': {
                                    'actionField': {
                                        'id': refId+'',
                                        'affiliation': '',
                                        'revenue': paymentInfo.premiumAmount+'',
                                        'tax': '0.00',
                                        'shipping': '0.00',
                                        'step': 5+'',
                                        'option': 'Travel Completed',
                                        'coupon': paymentInfo.promoCode ? paymentInfo.promoCode : ''
                                    },
                                    'products': products
                                }
                            }
                        });
                    }
                }
            });

            /**
             * Send interactions to the dataLayer, i.e. for event tracking in Google Analytics
             * @name eventTrack
             *
             * @param {string} action Required 'action' (string) associated with the event
             * @param {object} properties Comprised of the mandatory field 'category' (string) and optional  fields 'label' (string), 'value' (integer) and 'noninteraction' (boolean)
             */

            $analyticsProvider.registerEventTrack(function (action, properties) {
                var dataLayer = window.dataLayer = window.dataLayer || [];
                properties = properties || {};
                dataLayer.push({
                    'event': properties.event || 'interaction',
                    'target': properties.category,
                    'action': action,
                    'target-properties': properties.label,
                    'value': properties.value,
                    'interaction-type': properties.noninteraction
                });

            });
        }]);

})(angular);
