(function (angular) {
    'use strict';


    /**
     * @ngdoc overview
     * @name angulartics.google.analytics
     * Enables analytics support for Google Tag Manager (http://google.com/tagmanager)
     */

    angular.module('angulartics.google.tagmanager', ['angulartics'])
        .config(['$analyticsProvider', function ($analyticsProvider) {

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
                    dataLayer.push({
                        'event': 'checkout',
                        'ecommerce': {
                            'checkout': {
                                'actionField': {'step': 5, 'option': 'Payment Confirmation'}
                            }
                        }
                    });
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
