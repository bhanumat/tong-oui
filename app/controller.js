/**
 * Main application controller
 *
 * You can use this controller for your whole app if it is small
 * or you can have separate controllers for each logical section
 *
 */
;(function () {

    angular
        .module('cignaApp')
        .controller('MainController', MainController);

    MainController.$inject = [
        '$rootScope', '$scope', '$http', '$parse', 'parallaxHelper', '$filter', '$timeout', '$location', '$state', '$sce', '$q',
        'CONSTANTS', 'MESSAGES', 'PAYMENT_INFO', 'SessionStorage', 'LocalStorage', 'QueryService', 'dialogs'
    ];


    function MainController($rootScope, $scope, $http, $parse, parallaxHelper, $filter, $timeout, $location, $state, $sce, $q, CONSTANTS, MESSAGES, PAYMENT_INFO, SessionStorage, LocalStorage, QueryService, dialogs) {

        // 'controller as' syntax
        var self = this;
        var sessionTimeWarningPromise;
        var sessionTimePromise;
        var dialog;


        //Travel Model to keep data for post to Back-End
        $scope.travel = {};

        //Payment
        $scope.payment = {};
        $scope.nowYear = moment().get('year');
        $scope.tempData = {};
        $scope.tempData.voluntaryCollapse = [];
        $scope.tempData.destination = null;
        $scope.tempData.destinations = [];
        $scope.tempData.promotion = {
            "promoType": null,
            "promoValue": null,
            "promoFull": null
        };
        $scope.formStepSubmitted = false;
        $scope.tempData.currentState;
        $scope.tempData.isShowingDiscount = false;
        $scope.translatey = 'translatey(12.5%)';

        $scope.range = function (min, max, step) {
            step = step || 1;
            var input = [];
            for (var i = min; i <= max; i += step) input.push(i);
            return input;
        };

        self.reset = function () {
            LocalStorage.removeAll();
            $scope.start = true;

            //restore travelData;
            $scope.travelData.destinationList = $scope.travelData.destinationList.concat($scope.tempData.destinations);
            $scope.travel = {};
            $scope.tempData = {};
            $scope.payment = {};
            $scope.tempData.passengers = $scope.range(1, $scope.travelData.maxTraveller);
            $scope.tempData.provinceList = angular.copy($scope.travelData.provinceList);
            $scope.tempData.voluntaryCollapse = [];
            $scope.tempData.destination = null;
            $scope.tempData.destinations = [];
            $scope.tempData.promotion = {
                "promoType": null,
                "promoValue": null,
                "promoFull": null
            };
            $scope.formStepSubmitted = false;
        };

        /**
         * Load data from session if any
         */
        var foundStorageData = LocalStorage.get('insurance.travel');
        if (foundStorageData) {
            console.log('Found storage, ', $location.path());
            $scope.travel = LocalStorage.get('insurance.travel');
            $scope.travelData = LocalStorage.get('insurance.travelData');
            $scope.tempData = LocalStorage.get('insurance.tempData');
            $scope.messages = LocalStorage.get('insurance.messages');
            var sessionStartDate = LocalStorage.get('insurance.sessionStartDate');
            var cleanStorageRequired;
            var redirectRequired;
            $scope.tempData.currentState = $location.path() != $scope.tempData.currentState ? $location.path() : $scope.tempData.currentState;
            $scope.refId = $location.search().Ref;

            if ($scope.refId) {
                if ($location.path() == "/insurance/payment") {
                    dialog = dialogs.error('Error', $scope.messages['ER_ESA_011']);
                } else if ($location.path() == "/insurance/thankyou") {
                    cleanStorageRequired = true;
                }
            }

            if (sessionStartDate) {
                var startDate = moment(sessionStartDate);
                var sessionStartTimeout = startDate.add($scope.travelData.timeOut, 'minutes');
                var now = moment();
                if (sessionStartTimeout.utc().isBefore(now)) {//timeout
                    cleanStorageRequired = true;
                    redirectRequired = true;
                }
            }

            if (cleanStorageRequired) {
                self.reset();
                $scope.tempData.currentState = "/insurance/thankyou";
            }

            if (redirectRequired) {
                $location.path('/insurance');
                $location.replace();
            }
        } else {
            $scope.start = true;
        }

        if ($scope.start == true && !foundStorageData) {
            $scope.start = false;
            $location.path('/insurance/');
            $location.replace();
        }

        // comment for testing

        $scope.$on('$locationChangeStart', function (next, current) {
            if ($location.path() == '/insurance') {
                $location.path('/insurance/destination');
                $location.replace();
            }
            else if ($location.path() == '/plan') {
                $location.path('/insurance/plan');
                $location.replace();
            }
            else if ($location.path() == '/profile') {
                $location.path('/insurance/profile');
                $location.replace();
            }
            else {
                if (!$scope.start && !$scope.tempData.step1Completed) {
                    $location.path('/insurance/destination');
                    $location.replace();
                }
                $scope.tempData.currentState = $location.path();
            }

        });

        self.initSessionTimer = function () {
            var timeout = $scope.travelData.timeOut

            sessionTimeWarningPromise = $timeout(function () {
                dialog = dialogs.error('Warning', $scope.messages['ER_ESA_001']);
            }, (timeout - CONSTANTS.WARNING_BEFORE_TIMEOUT) * 60000);
            sessionTimePromise = $timeout(function () {
                dialog.close();
                var dlg = dialogs.error('Error', $scope.messages['ER_ESA_002']);
                dlg.result.then(function () {
                    self.reset();
                    $scope.tempData.currentState = "/insurance/destination";
                    $state.go('^.destination');
                }, function () {
                    $state.go('^.destination');
                });
            }, (timeout) * 60000);
        };

        self.restartTimer = function () {
            $timeout.cancel(sessionTimeWarningPromise);
            $timeout.cancel(sessionTimePromise);
            LocalStorage.update('insurance.sessionStartDate', new Date())
            self.initSessionTimer();
        };

        QueryService.query('POST', 'loadInitial').then(function (response) {
            $scope.travelData = response.data;
            $scope.messages = _.reduce($scope.travelData.resultCodes, function (result, n, key) {
                if (key === 1) {
                    result[result.resultCode] = result.resultDesc;
                    delete result.resultCode;
                    delete result.resultDesc;
                }
                result[n.resultCode] = n.resultDesc;
                return result;
            });
            LocalStorage.update('insurance.timeout', $scope.travelData.timeOut);
            self.initSessionTimer();
            $scope.tempData.passengers = $scope.range(1, $scope.travelData.maxTraveller);
            $scope.tempData.provinceList = angular.copy($scope.travelData.provinceList);
        });

        QueryService.query('POST', 'getToken').then(function (response) {
            $scope.travel.tokenCode = response.data.tokenCode;
        });

        $scope.$watch('travel.startDate', function () {
            if ($location.path() != '/insurance/destination') {
                $scope.tempData.travelDateChanged = true;
            }

        });

        $scope.$watch('travel.endDate', function () {
            if ($location.path() != '/insurance/destination') {
                $scope.tempData.travelDateChanged = true;
            }
        });

        $scope.$watch('travel.passengers', function (newValue, oldValue) {
            if ($location.path() == '/insurance/payment' && newValue != oldValue) {
                $location.path('/insurance/profile');
                $location.replace();
            }
        });

        $scope.$watch('travel.country', function () {
            if ($location.path() != '/insurance/destination') {
                $scope.tempData.countryChanged = true;
            }
        });

        $scope.passengersChange = function () {
            if (!$scope.tempData.passengersProfile) {
                $scope.travel.applicationList = [];
                $scope.tempData.passengersProfile = [];
                angular.forEach($scope.range(1, $scope.travel.passengers), function (value, index) {
                    $scope.travel.applicationList.push({});
                    $scope.tempData.passengersProfile.push({stage: 'edit'});
                });
            } else {
                var passengersArray = $scope.range(0, $scope.travel.passengers - 1);
                var profileArray = $scope.range(0, $scope.tempData.passengersProfile.length - 1);
                var differenceArray = _.difference(profileArray, passengersArray);
                var profileLength = $scope.tempData.passengersProfile.length;
                //console.log(differenceArray);
                if (profileLength > $scope.travel.passengers) {
                    $scope.travel.applicationList.splice(_.first(differenceArray), differenceArray.length);
                    $scope.tempData.passengersProfile.splice(_.first(differenceArray), differenceArray.length);
                } else if (profileLength < $scope.travel.passengers) {
                    angular.forEach($scope.range(1, ($scope.travel.passengers - profileLength)), function (value, index) {
                        $scope.travel.applicationList.push({});
                        $scope.tempData.passengersProfile.push({stage: 'edit'});
                    });
                }
            }
            $scope.tempData.passengersProfile[0].isManualAddress = true;
        };

        $scope.trustAsHtml = function (value) {
            return $sce.trustAsHtml(value);
        };

        $scope.editSummaryBar = function ($event, isFormValid) {
            console.log('editSummaryBar..');
            $scope.summaryBarSubmitted = true;
            if (!$scope.editingSummarybar) {
                $scope.editingSummarybar = true;
            } else {
                if (isFormValid) {
                    //reset state
                    $scope.editingSummarybar = false;

                    if ($scope.tempData.promoCodeChanged) {
                        self.validatePromotionCode().then(function () {
                            self.getCoverageTable().then(function () {
                                $scope.calculatePrice();
                            });
                        });
                    } else if ($scope.tempData.travelDateChanged || $scope.tempData.countryChanged) {
                        $scope.goToPlanSelection($event, isFormValid);
                    } else {
                        $scope.calculatePrice();
                    }

                    //  Add/Remove passengers profile.
                    var passengersProfileCount = $scope.tempData.passengersProfile ? $scope.tempData.passengersProfile.length : 0;
                    if ($scope.travel.passengers < passengersProfileCount) {
                        var dlg = dialogs.confirm('Warning', $scope.messages['ER_ESA_007']);
                        dlg.result.then(function (yesBtn) {
                            $scope.passengersChange();
                        }, function (noBtn) {
                            $scope.travel.passengers = $scope.tempData.passengersProfile.length;
                            $scope.calculatePrice();
                            $scope.editingSummarybar = true;
                        });
                    } else if ($scope.travel.passengers > $scope.tempData.passengersProfile.length) {
                        $scope.passengersChange();
                    }
                }
            }
        };

        $scope.checkPromotionCodeChange = function () {
            $scope.tempData.promoCodeChanged = $scope.tempData.promoCode !== $scope.travel.promoCode
            $scope.tempData.promoCode = $scope.travel.promoCode;
        };

        $scope.getPriceRate = function (plan) {
            var price = 0;
            if (plan && plan.rateScale && plan.rateScale.price) {//if any
                price = plan.rateScale.price;
            }
            return price;
        };

        $scope.calculateTotalPrice = function () {
            if ($scope.travelData.campaignList) {
                $scope.tempData.totalPrice = $scope.getPriceRate($scope.travel.mandatory);
                for (var i = 0, len = $scope.travel.voluntaryList.length; i < len; ++i) {
                    var voluntary = $scope.travel.voluntaryList[i];
                    $scope.tempData.totalPrice += $scope.getPriceRate(voluntary);
                }
                $scope.tempData.totalPrice *= $scope.travel.passengers;
            }
        };

        self.setupCampaign = function (campaign) {
            $scope.travel.campaignCode = campaign.campaignCode;
            $scope.travel.minAge = campaign.minAge;
            $scope.travel.maxAge = campaign.maxAge;
            $scope.travel.calculateMethod = campaign.calculateMethod;

            //Mandatory
            var foundIndexRateScale = 0;
            var rateScale;
            for (var i = 0, len = campaign.mandatory.rateScaleList.length; i < len; ++i) {
                rateScale = campaign.mandatory.rateScaleList[i];
                if (rateScale.rateScale === campaign.defaultRateScale) {
                    foundIndexRateScale = i;
                    break;
                }
            }

            //Fix invalid info from API if any
            if (!rateScale) {//Use first item as default
                rateScale = campaign.mandatory.rateScaleList[0];
            }

            $scope.tempData.selectedPlanIndex = foundIndexRateScale;
            $scope.travel.mandatory = {
                topicDetail: campaign.mandatory.topicDetail,
                coverageList: campaign.mandatory.coverageList,
                rateScale: rateScale
            }


            //Voluntary if any
            $scope.travel.voluntaryList = [];
            $scope.tempData.voluntaryCollapse = [];
            for (var i = 0, len = campaign.voluntaryList.length; i < len; ++i) {
                $scope.tempData.voluntaryCollapse[i] = true;
                var voluntary = campaign.voluntaryList[i];
                var rateScale;
                for (var j = 0, rateScaleLen = voluntary.rateScaleList.length; j < rateScaleLen; ++j) {
                    rateScale = voluntary.rateScaleList[j];
                    if (rateScale.rateScale === campaign.defaultRateScale) {
                        break;
                    }
                }
                //Fix invalid info from API if any
                if (!rateScale) {//Use first item as default
                    rateScale = voluntary.rateScaleList[foundIndexRateScale];
                }

                $scope.travel.voluntaryList.push({
                    topicDetail: voluntary.topicDetail,
                    coverageList: voluntary.coverageList,
                    rateScale: rateScale
                });
            }

        };

        self.updateSelectedCampaign = function (campaign) {
            $scope.travel.campaignCode = campaign.campaignCode;
            $scope.travel.minAge = campaign.minAge;
            $scope.travel.maxAge = campaign.maxAge;
            $scope.travel.calculateMethod = campaign.calculateMethod;

            $scope.travel.mandatory = {
                topicDetail: campaign.mandatory.topicDetail,
                coverageList: campaign.mandatory.coverageList,
                rateScale: campaign.mandatory.rateScaleList[$scope.tempData.selectedPlanIndex]
            };

            for (var i = 0, len = campaign.voluntaryList.length; i < len; i++) {
                var voluntary = campaign.voluntaryList[i];
                $scope.travel.voluntaryList[i] = {
                    topicDetail: voluntary.topicDetail,
                    coverageList: voluntary.coverageList,
                    rateScale: voluntary.rateScaleList[$scope.tempData.selectedPlanIndex]
                };
            }
        };

        self.initDefaultCampaign = function () {
            var campaigns = $scope.travelData.campaignList;
            if (!$scope.travel.mandatory) {
                var campaign;
                for (var i = 0, len = campaigns.length; i < len; ++i) {
                    campaign = campaigns[i];
                    if (campaign.defaultFlag) {
                        break;
                    }
                }
                if (!campaign) {
                    campaign = campaigns[0];
                }
                self.setupCampaign(campaign);
            } else {
                //Update travel
                var campaign;
                for (var i = 0, len = campaigns.length; i < len; ++i) {
                    campaign = campaigns[i];
                    if (campaign.campaignCode = $scope.travel.campaignCode) {
                        break;
                    }
                }
                if (campaign) {
                    self.setupCampaign(campaign);
                    self.updateSelectedCampaign(campaign);
                }
            }
        };

        $scope.calculatePrice = function () {
            $scope.calculateTotalPrice();
            $scope.tempData.price = $scope.tempData.totalPrice;
            $scope.travel.premiumAmount = $scope.tempData.price
        };

        $scope.changeStage = function (index, stage, validate) {
            if (!$scope.tempData.passengersProfile[index]) {
                $scope.tempData.passengersProfile[index] = {};
                $scope.tempData.passengersProfile[index].stage = '';
                $scope.tempData.passengersProfile[index].profileFormSubmitted = false;
                $scope.travel.applicationList[index] = {}
            }
            if (stage == 'edit') {
                $scope.tempData.passengersProfile[index].profileFormSubmitted = false;
                $scope.tempData.passengersProfile[index].stage = stage;
                $scope.tempData.passengersProfile[index].profileForm = null;
            }
            if (stage == 'saved') {
                $scope.tempData.passengersProfile[index].profileFormSubmitted = true;
                if (validate) {
                    $scope.tempData.passengersProfile[index].profileFormSubmitted = false;
                    $scope.tempData.passengersProfile[index].profileForm = true;
                    $scope.tempData.passengersProfile[index].stage = stage;
                }
            }
            if (stage == 'reset') {
                var dlg = dialogs.confirm('Warning', $scope.messages['ER_ESA_007']);
                dlg.result.then(function (yesBtn) {
                    $scope.tempData.passengersProfile.splice(index, 1);
                    $scope.tempData.passengersProfile.push({profileFormSubmitted: false, stage: '', profileForm: null});
                    $scope.travel.applicationList.splice(index, 1);
                    //$scope.travel.applicationList.push({});
                }, function (noBtn) {

                });
            }

        };

        $scope.copyPassengerAddress = function (templateIndex, targetIndex) {
            console.log(templateIndex + ':' + targetIndex);
            if (!$scope.travel.applicationList[targetIndex]) {
                $scope.travel.applicationList[targetIndex] = {};
            }
            $scope.tempData.passengersProfile[targetIndex].referenceAddress = templateIndex;
            $scope.travel.applicationList[targetIndex].address = angular.copy($scope.travel.applicationList[templateIndex].address);
            $scope.tempData.passengersProfile[targetIndex].provinceSelected = angular.copy($scope.tempData.passengersProfile[templateIndex].provinceSelected);
        };

        $scope.addAddress = function (index) {
            $scope.tempData.passengersProfile[index].isManualAddress = true;
            if (!$scope.travel.applicationList[index].address)
                $scope.travel.applicationList[index].address = {};
        };

        $scope.addBeneficiary = function (index, validate) {
            if ($scope.tempData.passengersProfile[index].beneficiaries) {
                if (validate) {
                    $scope.beneficiaryFormSubmitted = false;
                    if ($scope.tempData.passengersProfile[index].beneficiaries < 3) {
                        $scope.travel.applicationList[index].beneficiaryList.push({});
                        $scope.tempData.passengersProfile[index].beneficiaries += 1;
                    }
                }
                else {
                    $scope.beneficiaryFormSubmitted = true;
                }
            }
            else {
                $scope.travel.applicationList[index].beneficiaryList = [{}];
                $scope.tempData.passengersProfile[index].beneficiaries = 1;
            }
        };

        $scope.deleteBeneficiaryList = function (profileIdx, beneficiaryIdx) {
            $scope.tempData.passengersProfile[profileIdx].beneficiaries -= 1;
            if ($scope.travel.applicationList[profileIdx].beneficiaryList) {
                $scope.travel.applicationList[profileIdx].beneficiaryList.splice(beneficiaryIdx, 1);
            }
            else {
                $scope.travel.applicationList[profileIdx].beneficiaryList.push({});
            }
            $scope.beneficiaryFormSubmitted = false;
        };

        $scope.isSchengen = function () {
            for (var i = 0; i < $scope.tempData.destinations.length; i++) {
                if ($scope.tempData.destinations[i].type == "02") {
                    $scope.tempData.isSchengen = true;
                    return true;
                }
                else {
                    $scope.tempData.isSchengen = false;
                }
            }
            return false;
        };

        $scope.isRequiredEng = function () {
            for (var i = 0; i < $scope.tempData.destinations.length; i++) {
                if ($scope.tempData.destinations[i].requiredEng == "Y" || $scope.tempData.destinations[i].requiredEng == true) {
                    $scope.tempData.isRequiredEng = true;
                    return true;
                }
                else {
                    $scope.tempData.isRequiredEng = false;
                }
            }
            return false;
        };

        $scope.isAsia = function () {
            for (var i = 0; i < $scope.tempData.destinations.length; i++) {
                if ($scope.tempData.destinations[i].type == "01") {
                    $scope.tempData.isAsia = true;
                    return true;
                }
                else {
                    $scope.tempData.isAsia = false;
                }
            }
            return false;
        };

        $scope.isWorldWide = function () {
            var isWorld = function () {
                for (var i = 0; i < $scope.tempData.destinations.length; i++) {
                    if ($scope.tempData.destinations[i].type == "03") {
                        $scope.tempData.isAsia = true;
                        return true;
                    }
                    else {
                        $scope.tempData.isAsia = false;
                    }
                }
                return false;
            }
            if ($scope.isSchengen() && $scope.isAsia() || isWorld()) {
                return true;
            }
            return false;
        };

        $scope.getProtectionArea = function () {
            if ($scope.isWorldWide()) {
                return 'world wide';
            }
            else if ($scope.isAsia()) {
                return 'asia';
            }
            else {
                return 'schengen';
            }
            return false;
        };

        $scope.termsToggle = function (index) {
            if (!$scope.tempData.passengersProfile[index].termsAccepted) {
                $scope.tempData.passengersProfile[index].termsAccepted = true;
            }
            else {
                $scope.tempData.passengersProfile[index].termsAccepted = false;
            }
            // console.log($scope.tempData.passengersProfile[index].termsAccepted);
        };

        $scope.voluntaryToggle = function (campaignIndex, voluntaryIndex, rateScaleIndex) {
            if (rateScaleIndex == $scope.tempData.selectedPlanIndex) {
                if ($scope.travel.voluntaryList[voluntaryIndex].rateScale) {//existing
                    //Currently, no id for voluntary. So, cannot remove item it will cause index invalid.
                    $scope.travel.voluntaryList[voluntaryIndex] = {};
                } else {
                    var voluntary = $scope.travelData.campaignList[campaignIndex].voluntaryList[voluntaryIndex];
                    $scope.travel.voluntaryList[voluntaryIndex] = {
                        topicDetail: voluntary.topicDetail,
                        coverageList: voluntary.coverageList,
                        rateScale: voluntary.rateScaleList[rateScaleIndex]
                    };//Restore
                }

                $scope.calculatePrice();
            }
        };

        $scope.submitOrder = function ($event, paymentForm) {
            // set to true to show all error messages (if there are any)
            $scope.formStepSubmitted = true;
            if (paymentForm.$valid) {
                $scope.formStepSubmitted = false;
                $scope.isProcessing = true;

                //Store data to session storage before payment
                var submitOrderParams = angular.copy($scope.travel);
                submitOrderParams.mandatoryCode = $scope.travel.mandatory.rateScale.groupId;
                submitOrderParams.rateScale = $scope.travel.mandatory.rateScale.rateScale;
                submitOrderParams.voluntaryCodeList = _.pluck(_.pluck($scope.travel.voluntaryList, 'rateScale'), 'groupId');
                submitOrderParams.startDate = moment(submitOrderParams.startDate, CONSTANTS.DATE_FORMAT_DISPLAY).format(CONSTANTS.DATE_FORMAT);
                submitOrderParams.endDate = moment(submitOrderParams.endDate, CONSTANTS.DATE_FORMAT_DISPLAY).format(CONSTANTS.DATE_FORMAT);
                for (var i = 0, len = submitOrderParams.applicationList.length; i < len; i++) {
                    var profile = submitOrderParams.applicationList[i];
                    profile.dateOfBirth = moment(profile.dateOfBirth, CONSTANTS.DATE_FORMAT_DISPLAY).format(CONSTANTS.DATE_FORMAT);
                }

                submitOrderParams.payment = {};
                var pad = "00";
                var month = ''+$scope.payment.expiryMonth;
                var mm = pad.substring(0, pad.length - month.length) + month;
                var yy = (''+$scope.payment.expiryYear).substr(2,2);
                submitOrderParams.payment.creditCardExpired =mm  + yy;
                submitOrderParams.payment.creditCardNo = $scope.payment.creditCardNo;
                submitOrderParams.payment.creditCardName = $scope.payment.creditCardName;

                delete submitOrderParams.mandatory;
                delete submitOrderParams.voluntaryList;

                QueryService.query('POST', 'submitOrder', undefined, submitOrderParams).then(function (response) {
                    self.restartTimer();
                    $scope.formStepSubmitted = false;
                    $scope.tempData.trackingNumber = response.data.trackingNumber;
                    $scope.tempData.orderId = response.data.orderId;
                    $scope.tempData.currentState = "/insurance/payment";

                    //Store data to session storage before payment
                    LocalStorage.update('insurance.travel', $scope.travel);
                    LocalStorage.update('insurance.travelData', $scope.travelData);
                    LocalStorage.update('insurance.tempData', $scope.tempData);
                    LocalStorage.update('insurance.messages', $scope.messages);
                    var data = {
                        actionUrl: $sce.trustAsResourceUrl(PAYMENT_INFO.paymentUrl),
                        method: 'POST',
                        inputData: {
                            merchantId: PAYMENT_INFO.merchantId,
                            amount: $scope.travel.premiumAmount,
                            orderRef: $scope.tempData.trackingNumber,
                            currCode: PAYMENT_INFO.currCode,
                            pMethod: $scope.payment.cardType,
                            cardNo: $scope.payment.creditCardNo,
                            securityCode: $scope.payment.cvv2,
                            cardHolder: $scope.payment.creditCardName,
                            epMonth: $scope.payment.expiryMonth,
                            epYear: $scope.payment.expiryYear,
                            successUrl: PAYMENT_INFO.successUrl,
                            failUrl: PAYMENT_INFO.failUrl,
                            cancelUrl: PAYMENT_INFO.cancelUrl,
                            payType: PAYMENT_INFO.payType,
                            lang: PAYMENT_INFO.lang,
                            remark: PAYMENT_INFO.remark
                        }
                    };

                    $rootScope.$broadcast('gateway.redirect', data);
                });
            } else {
                $event.preventDefault();
                $event.stopPropagation();
            }
        };

        self.validatePromotionCode = function () {
            var deferred = $q.defer();
            var validatePromoCodeParams = {
                tokenCode: $scope.travel.tokenCode,
                promoCode: $scope.travel.promoCode
            };
            QueryService.query('POST', 'validatePromoCode', validatePromoCodeParams, validatePromoCodeParams).then(function (response) {
                self.restartTimer();
                $scope.tempData.promoCodeChanged = false;
                $scope.tempData.promotion = response.data.promotion;
                if ($scope.tempData.promotion.promoFull === 'Y') {
                    deferred.reject(response);
                    $scope.travel.promoCode = null;
                    dialogs.error('Warning', $scope.messages['ER_ESA_005']);
                } else {
                    deferred.resolve(response);
                }
            }, function (response) {
                $scope.travel.promoCode = null;
                if (response.status == 500) {
                    dialogs.error('Error', $scope.messages['ER_ESA_004']);
                }
            });

            return deferred.promise;
        };

        $scope.goToPlanSelection = function ($event, isFormValid) {
            // set to true to show all error messages (if there are any)
            $scope.formStepSubmitted = true;
            if (isFormValid) {
                $scope.tempData.step1Completed = true;
                $scope.tempData.travelDateChanged = false;
                $scope.tempData.countryChanged = false;
                if ($scope.travel.promoCode) {
                    //validate promotion code if any
                    self.validatePromotionCode().then(function () {
                        self.getCoverageTable().then(function () {
                            $scope.calculatePrice();
                            $scope.formStepSubmitted = false;

                            if ($scope.tempData.currentState != '/insurance/plan') {
                                $state.go('^.plan');
                            }
                        });
                    });
                } else {
                    self.getCoverageTable().then(function () {
                        $scope.calculatePrice();
                        $scope.formStepSubmitted = false;

                        if ($scope.tempData.currentState != '/insurance/plan') {
                            $state.go('^.plan');
                        }
                    });
                }
            }
        };

        $scope.goToPayment = function ($event, isFormValid) {
            // set to true to show all error messages (if there are any)
            if (isFormValid) {
                var duplicateIdCardList = self.checkDuplicateIdCard();
                if (duplicateIdCardList.length == 0) {
                    var checkBlacklistParam = self.initCheckBlacklistParam();
                    QueryService.query('POST', 'checkBlacklist', undefined, checkBlacklistParam).then(function (response) {
                        var blacklists = _.where(response.data.blacklists, {result: true});
                        if (blacklists && blacklists.length > 0) {
                            dialogs.notify('Warning', $scope.messages['ER_ESA_008']);
                        } else {
                            var checkOverlapParam = self.initCheckOverlapParam();
                            QueryService.query('POST', 'validateOverlap', undefined, checkOverlapParam).then(function (response) {
                                var overlaps = _.where(response.data.overlaps, {result: true});
                                //console.log('overlaps : '+overlaps);
                                if (overlaps && overlaps.length > 0) {
                                    dialogs.notify('Warning', self.buildProfileWarningMessage(overlaps, $scope.messages['ER_ESA_009']));
                                } else {
                                    //Store data to session storage before payment
                                    $state.go('^.payment');
                                }
                            });
                        }
                    });
                } else {
                    dialogs.notify('Warning', self.buildProfileWarningMessageFromList(duplicateIdCardList, $scope.messages['ER_ESA_010']));
                }
            }
        };

        $scope.goToProfile = function (isFormValid) {
            // set to true to show all error messages (if there are any)
            $scope.formStepSubmitted = true;

            if (isFormValid) {
                $scope.formStepSubmitted = false;
                $scope.tempData.step2Completed = true;
                $state.go('^.profile');
                if (!$scope.tempData.passengersProfile)
                    $scope.passengersChange();
            }
        };

        $scope.confirmPlanSelected = function ($event, isFormValid) {
            //$event.preventDefault();
            //$event.stopPropagation();
            $scope.formStepSubmitted = true;
            if (isFormValid) {
                $scope.tempData.step2Completed = true;
                var hasVoluntary = false;
                for (var i = 0, len = $scope.travel.voluntaryList.length; i < len; ++i) {
                    var voluntary = $scope.travel.voluntaryList[i];
                    hasVoluntary = hasVoluntary || voluntary.topicDetail;
                }
                if ($scope.travel.voluntaryList.length > 1 && hasVoluntary) {
                    $scope.goToProfile(isFormValid);
                } else {
                    var dlg = dialogs.confirm('Warning', $scope.messages['ER_ESA_006']);
                    dlg.result.then(function (yesBtn) {
                        $scope.goToProfile(isFormValid);
                    }, function (noBtn) {
                    });
                }
            }
        }

        $scope.isRateScaleSameAsSelected = function (rateScale) {
            if (rateScale)
                return rateScale.rateScale == $scope.travel.mandatory.rateScale.rateScale;
            else
                return false;
        };

        $scope.hideRateScale = function (index) {
            var hideRateScaleRightSide = index < $scope.tempData.selectedPlanIndex - 1;
            var hideRateScaleLeftSide = index < $scope.travelData.campaignList[0].mandatory.rateScaleList.length - 3;
            return hideRateScaleRightSide && hideRateScaleLeftSide;
        };

        $scope.showLeftPlanNavigator = function (campaign, index) {
            if ($scope.travelData.campaignList.length <= 1) {
                return $scope.tempData.selectedPlanIndex > 1 && campaign.mandatory.rateScaleList.length > 3;
            } else {
                if (campaign.mandatory.rateScaleList.length <= 3) {
                    return index > 0;
                } else {
                    return $scope.tempData.selectedPlanIndex > 1 && campaign.mandatory.rateScaleList.length > 3;
                }
            }
        };

        $scope.showRightPlanNavigator = function (campaign, index) {
            if ($scope.travelData.campaignList.length <= 1) {
                return $scope.tempData.selectedPlanIndex < campaign.mandatory.rateScaleList.length - 2;
            } else {
                if (campaign.mandatory.rateScaleList.length <= 3) {
                    return index < $scope.travelData.campaignList.length - 1;
                } else {
                    return $scope.tempData.selectedPlanIndex < campaign.mandatory.rateScaleList.length - 2;
                }
            }
        };

        $scope.selectPlan = function (campaignIndex, campaign, rateScaleIndex, rateScale) {
            if (rateScaleIndex > campaign.mandatory.rateScaleList.length - 1) {
                //Show next campaign
                self.setupCampaign($scope.travelData.campaignList[campaignIndex + 1]);
            } else if (rateScaleIndex < 0) {
                //Show previous campaign
                self.setupCampaign($scope.travelData.campaignList[campaignIndex - 1]);
            } else {
                $scope.tempData.selectedPlanIndex = rateScaleIndex;
                self.updateSelectedCampaign(campaign);
                if (rateScaleIndex < 2) {
                    $scope.translatey = 'translatey(12.5%)';
                }
                else if ((rateScaleIndex > 1) && (rateScaleIndex < campaign.mandatory.rateScaleList.length - 1)) {
                    $scope.translatey = 'translatey(' + parseFloat(12.5 - ((rateScaleIndex - 1) * 25)) + '%)';
                }
                else if (rateScaleIndex == campaign.mandatory.rateScaleList.length - 1) {
                    $scope.translatey = 'translatey(' + parseFloat(12.5 - ((rateScaleIndex - 2) * 25)) + '%)';
                }
            }

            $scope.calculatePrice();
        };

        $scope.addDestination = function () {
            if ($scope.tempData.destinations) {
                if ($scope.tempData.destinations.length < 10) {
                    $scope.tempData.destinations.push($scope.tempData.destination);
                    $scope.travelData.destinationList = $filter('filter')($scope.travelData.destinationList, {country: "!" + $scope.tempData.destination.country}, true);
                    $scope.tempData.destination = "";
                    $scope.travel.destination = $scope.getProtectionArea();
                    $scope.travel.country = _.pluck($scope.tempData.destinations, 'id').join(',')
                    $scope.isSchengen();
                    $scope.isRequiredEng();
                }
            }
        };

        $scope.removeDestination = function (index) {
            $scope.travelData.destinationList.push($scope.tempData.destinations[index]);
            $scope.tempData.destinations = $filter('filter')($scope.tempData.destinations, {country: "!" + $scope.tempData.destinations[index].country}, true);
            $scope.travel.destination = $scope.getProtectionArea();
            $scope.travel.country = _.pluck($scope.tempData.destinations, 'country').join('|')
            $scope.isSchengen();
            $scope.isRequiredEng();
        };

        //datepicker

        $scope.addDays = function (date, days) {
            var result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };

        $scope.calcTravelDays = function () {
            var end = Date.parse($scope.tempData.endDateForCal);
            var begin = Date.parse($scope.tempData.startDateForCal);
            $scope.travel.days = moment(end).diff(begin, 'days') + 1;
            $scope.tempData.daysAsText = "รวม " + $scope.travel.days + " วัน";
        };

        $scope.toggleCollapse = function (index) {
            $scope.tempData.voluntaryCollapse[index] = !$scope.tempData.voluntaryCollapse[index];
        };

        $scope.isCollapsed = function (index) {
            return $scope.tempData.voluntaryCollapse[index];
        };

        $scope.showAsMarked = function (sumInsureValue) {
            return sumInsureValue === '1';
        };

        $scope.today = new Date();
        $scope.tempData.maxDate = $scope.addDays($scope.today, 90);
        $scope.tempData.minDate = $scope.addDays($scope.today, 1);

        //datepicker

        $scope.background = parallaxHelper.createAnimator(-0.05);

        self.getCoverageTable = function () {
            var deferred = $q.defer();
            var area = $scope.getProtectionArea();
            var getCoverageTableParams = {
                tokenCode: $scope.travel.tokenCode,
                area: area,
                days: $scope.travel.days,
                promoCode: $scope.travel.promoCode,
                loginFlag: 'N'
            };
            QueryService.query('POST', 'getCoverageTable', getCoverageTableParams, getCoverageTableParams)
                .then(function (response) {
                    self.restartTimer();
                    $scope.travelData.campaignList = response.data.campaignList;
                    self.initDefaultCampaign();
                    deferred.resolve(response);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        $scope.getIndexOfByCode = function (code, items) {
            return _.findIndex(items, {code: code});
        }

        $scope.validCardType = (function () {
            var cards = PAYMENT_INFO.cards;
            return {
                test: function (number) {
                    for (var card in cards) {
                        if (cards[card].test(number)) {
                            $scope.payment.cardType = card;
                            return card;
                        }
                    }
                    return false;
                }
            };
        })();

        $scope.validAge = (function () {
            var calculateNextAge = function (startDate, birthDate) {
                var yearPrecision = moment(startDate).diff(birthDate, 'years', true);
                return Math.ceil(yearPrecision);
            };
            var calculateLastAge = function (startDate, birthDate) {
                var yearPrecision = moment(startDate).diff(birthDate, 'years', true);
                return Math.floor(yearPrecision);
            };
            var calculateNearAge = function (startDate, birthDate) {
                var yearPrecision = moment(startDate).diff(birthDate, 'years', true);
                var year = moment(startDate).diff(birthDate, 'years');
                var month = Math.floor((yearPrecision - year) * 12);
                return year + Math.round(month / 12);
            };
            var calculateMethods = {
                "01": calculateNextAge, "02": calculateLastAge, "03": calculateNearAge
            };
            var calculateAge = function (method, travelDate, birthOfDate) {
                return calculateMethods[method](travelDate, birthOfDate);
            };
            return {
                test: function (date) {
                    var days = moment($scope.travel.startDate, CONSTANTS.DATE_FORMAT_DISPLAY).diff(moment(), 'days');
                    var startDate = moment().add(days, 'days');
                    var age = calculateAge($scope.travel.calculateMethod, startDate, moment(date, CONSTANTS.DATE_FORMAT_DISPLAY));
                    //console.log('age=',age);
                    return age >= $scope.travel.minAge && age <= $scope.travel.maxAge;
                }
            };
        })();

        self.initCheckBlacklistParam = function () {
            var checkBlacklistParam = {
                tokenCode: $scope.travel.tokenCode,
                blacklists: []
            };
            angular.forEach($scope.travel.applicationList, function (obj, index) {
                checkBlacklistParam.blacklists.push({
                    firstname: obj.firstnameTh,
                    lastname: obj.lastnameTh,
                    ssn: obj.ssn
                });
            });
            return checkBlacklistParam;
        };

        self.initCheckOverlapParam = function () {
            var checkOverlapParam = {
                tokenCode: $scope.travel.tokenCode,
                overlaps: []
            };
            angular.forEach($scope.travel.applicationList, function (obj, index) {
                var checkOverlapObj = {
                    ssn: obj.ssn,
                    startTravelDate: moment($scope.travel.startDate, CONSTANTS.DATE_FORMAT_DISPLAY).format(CONSTANTS.DATE_FORMAT),
                    endTravelDate: moment($scope.travel.endDate, CONSTANTS.DATE_FORMAT_DISPLAY).format(CONSTANTS.DATE_FORMAT)
                };
                checkOverlapParam.overlaps.push(checkOverlapObj);
            });
            return checkOverlapParam;
        };

        self.buildProfileWarningMessage = function (list, notifyMessage) {
            var message = '';
            var profileWarningMessage;
            angular.forEach(list, function (item, index) {
                var profile = _.findWhere($scope.travel.applicationList, {ssn: item.ssn});
                if (profile) {
                    var thaiName = $scope.travelData.titleList[$scope.getIndexOfByCode(profile.title, $scope.travelData.titleList)].thaiName;
                    message += '<br/>';
                    message += (thaiName + ' ' + profile.firstnameTh + ' ' + profile.lastnameTh);
                }
            });
            if (message) {
                profileWarningMessage = notifyMessage.replace('{{msg}}', message);
            } else {
                profileWarningMessage = notifyMessage;
            }
            return profileWarningMessage;
        };

        $scope.changeProvince = function (applicationIndex, provinceCode) {
            //console.log('changeProvince..' + provinceCode);
            if (!provinceCode)
                return;
            var provinceParam = {
                tokenCode: $scope.travel.tokenCode,
                loginFlag: 'N',
                provinceCode: provinceCode
            };
            if(!$scope.travel.applicationList[applicationIndex].address)
                $scope.travel.applicationList[applicationIndex].address = {};

            $scope.travel.applicationList[applicationIndex].address.district = null;
            $scope.travel.applicationList[applicationIndex].address.subDistrict = null;
            $scope.travel.applicationList[applicationIndex].address.zipcode = null;
            $scope.tempData.passengersProfile[applicationIndex].provinceSelected = _.findWhere($scope.tempData.provinceList, {code: provinceCode});
            QueryService.query('POST', 'getDistricts', undefined, provinceParam).then(function (response) {
                $scope.tempData.passengersProfile[applicationIndex].provinceSelected.districtList = response.data.districts;
            });
        };

        $scope.changeDistrict = function (applicationIndex, districtCode) {
            //console.log('changeDistrict..' + districtCode);
            if (!districtCode)
                return;
            var districtParam = {
                tokenCode: $scope.travel.tokenCode,
                loginFlag: 'N',
                districtCode: districtCode
            };
            if(!$scope.travel.applicationList[applicationIndex].address)
                $scope.travel.applicationList[applicationIndex].address = {};

            $scope.travel.applicationList[applicationIndex].address.subDistrict = null;
            $scope.travel.applicationList[applicationIndex].address.zipcode = null;
            var idx = $scope.getIndexOfByCode(districtCode, $scope.tempData.passengersProfile[applicationIndex].provinceSelected.districtList);
            QueryService.query('POST', 'getSubDistricts', undefined, districtParam).then(function (response) {
                $scope.tempData.passengersProfile[applicationIndex].provinceSelected.districtList[idx].subDistrictList = response.data.subDistricts;
            });
        };

        self.checkDuplicateIdCard = function () {
            var duplicateList = [];
            angular.forEach($scope.travel.applicationList, function (obj) {
                var checkList = _.findWhere(duplicateList, {ssn: obj.ssn});
                if (!checkList) {
                    var applications = _.where($scope.travel.applicationList, {ssn: obj.ssn});
                    if (applications.length > 1) {
                        //applications.splice(0, 1);
                        duplicateList = _.union(duplicateList, applications);
                    }
                }
            });
            return duplicateList;
        };

        self.buildProfileWarningMessageFromList = function (list, notifyMessage) {
            var message = '';
            var profileWarningMessage;
            angular.forEach(list, function (profile, index) {
                if (profile) {
                    var thaiName = $scope.travelData.titleList[$scope.getIndexOfByCode(profile.title, $scope.travelData.titleList)].thaiName;
                    message += '<br/>';
                    message += (thaiName + ' ' + profile.firstnameTh + ' ' + profile.lastnameTh);
                }
            });
            if (message) {
                profileWarningMessage = notifyMessage.replace('{{msg}}', message);
            } else {
                profileWarningMessage = notifyMessage;
            }
            return profileWarningMessage;
        };
    }

})();
