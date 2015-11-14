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
        '$scope', '$http', '$parse', 'parallaxHelper', '$filter', '$timeout', '$location', '$state', '$sce', '$q',
        'CONSTANTS', 'MESSAGES', 'PAYMENT_INFO', 'SessionStorage', 'LocalStorage', 'QueryService', 'dialogs'
    ];


    function MainController($scope, $http, $parse, parallaxHelper, $filter, $timeout, $location, $state, $sce, $q, CONSTANTS, MESSAGES, PAYMENT_INFO, SessionStorage, LocalStorage, QueryService, dialogs) {

        // 'controller as' syntax
        var self = this;
        var sessionTimeWarningPromise;
        var sessionTimePromise;

        $scope.refId = $location.search().Ref;

        //Travel Model to post back to API
        $scope.travel = {};

        //Payment
        $scope.paymentInfo = PAYMENT_INFO;
        $scope.action = $sce.trustAsResourceUrl(PAYMENT_INFO.paymentUrl);

        $scope.tempData = {passengers: 1};
        $scope.tempData.voluntaryCollapse = [];
        $scope.tempData.destination = null;
        $scope.tempData.destinations = [];
        $scope.tempData.promotion = {
            "promoType": null,
            "promoValue": null,
            "promoFull": null
        };
        $scope.formStepSubmitted = false;
        $scope.tempData.currentState = $location.path();
        //$scope.tempData.passengersProfile = [];
        //$scope.tempData.passengersProfile[1] = {};
        //$scope.tempData.passengersProfile[1].stage = "edit";
        //$scope.tempData.passengersProfile[1].isManualAddress = true;
        $scope.tempData.isShowingDiscount = false;
        $scope.translatey = 'translatey(12.5%)';

        /**
         * Load data from session if any
         */
        if (LocalStorage.get('insurance.travel')) {

            console.log('Found storage');
            $scope.travel = LocalStorage.get('insurance.travel');
            $scope.travelData = LocalStorage.get('insurance.travelData');
            $scope.tempData = LocalStorage.get('insurance.tempData');

            $scope.tempData.currentState = $location.path() != $scope.tempData.currentState ? $location.path() : $scope.tempData.currentState;

            var sessionStartDate = LocalStorage.get('insurance.sessionStartDate');

            if (sessionStartDate) {
                var sessionStartTimeout = moment(sessionStartDate).add($scope.travelData.timeOut, 'minutes');
                var now = moment();

                if (sessionStartTimeout.isBefore(now)) {//timeout
                    LocalStorage.removeAll();
                }
                console.log(sessionStartDate);
            }
        }

        ////////////  function definitions
        $scope.start = true;
        if ($scope.start == true && !$scope.tempData.currentState) {
            $scope.start = false;
            $location.path('/insurance/destination');
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
                $scope.tempData.currentState = $location.path();
            }

        });

        self.initSessionTimer = function () {
            var timeout = LocalStorage.get('insurance.timeout');
            var warningDialog;
            sessionTimeWarningPromise = $timeout(function () {
                warningDialog = dialogs.error('Warning', MESSAGES['timeout_warning']);
            }, (timeout - 5) * 60000);
            sessionTimePromise = $timeout(function () {
                warningDialog.close();
                var dlg = dialogs.error('Error', MESSAGES['timeout']);
                dlg.result.then(function () {
                    LocalStorage.removeAll();
                    $location.path('/insurance/destination');
                    $location.replace();
                }, function () {
                    $location.path('/insurance/destination');
                    $location.replace();
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
            LocalStorage.update('insurance.timeout', $scope.travelData.timeOut);
            self.initSessionTimer();
            $scope.tempData.passengers = $scope.range(1, $scope.travelData.maxTraveller);
        });

        QueryService.query('POST', 'getToken').then(function (response) {
            $scope.travel.tokenCode = response.data.tokenCode;
        });

        //QueryService.query('POST', 'submitOrder').then(function (response) {
        //$scope.travel.applicationList = response.data.applicationList;
        //}, function (response) {
        //});

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
            console.log('$watch travel.passengers : ' + newValue + ', '+ oldValue);
            if ($location.path() == '/insurance/payment') {
                $location.path('/insurance/profile');
                $location.replace();
            }
        });

        $scope.$watch('travel.country', function () {
            if ($location.path() != '/insurance/destination') {
                $scope.tempData.countryChanged = true;
            }
        });

        $scope.passengersChange = function(){
            if (!$scope.travel.applicationList) {
                $scope.travel.applicationList = [];
                $scope.tempData.passengersProfile = [];
                angular.forEach($scope.range(1, $scope.travel.passengers), function (value, index) {
                    $scope.travel.applicationList.push({});
                    $scope.tempData.passengersProfile.push({stage: 'edit'});
                });
            } else {
                var applicationLength = $scope.travel.applicationList.length;
                var passengersArray = $scope.range(0, $scope.travel.passengers - 1);
                var applicationArray = $scope.range(0, $scope.travel.applicationList.length - 1);
                var differenceArray = _.difference(applicationArray, passengersArray);
                console.log(differenceArray);
                if (applicationLength > $scope.travel.passengers) {
                    $scope.travel.applicationList.splice(_.first(differenceArray), differenceArray.length);
                    $scope.tempData.passengersProfile.splice(_.first(differenceArray), differenceArray.length);
                } else if (applicationLength < $scope.travel.passengers) {
                    angular.forEach($scope.range(1, ($scope.travel.passengers - applicationLength)), function (value, index) {
                        $scope.travel.applicationList.push({});
                        $scope.tempData.passengersProfile.push({stage: 'edit'});
                    });
                }
            }
            $scope.tempData.passengersProfile[0].isManualAddress = true;
        }

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

                    //reset state
                    $scope.editingSummarybar = false;
                    $scope.tempData.promoCodeChanged = false;
                    $scope.tempData.travelDateChanged = false;
                    $scope.tempData.countryChanged = false;
                    //  Add/Remove passengers profile.
                    if($scope.travel.passengers < $scope.travel.applicationList.length){
                        var dlg = dialogs.confirm('Warning', MESSAGES['confirm_passengers_change']);
                        dlg.result.then(function (yesBtn) {
                            $scope.passengersChange();
                        }, function (noBtn) {
                            $scope.travel.passengers = $scope.travel.applicationList.length;
                            $scope.calculatePrice();
                            $scope.editingSummarybar = true;
                        });
                    } else if($scope.travel.passengers > $scope.travel.applicationList.length){
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
            for (var i = 0, len = campaign.voluntaryList.length; i < len; ++i) {
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
                $scope.travel.voluntaryList[i]={
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
                $scope.travel.applicationList[index].dateOfBirth = '';
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
                $scope.tempData.passengersProfile[index].profileFormSubmitted = false;
                $scope.travel.applicationList[index] = {};
                $scope.tempData.passengersProfile[index].termsAccepted = false;
                $scope.tempData.passengersProfile[index].stage = "";
                $scope.tempData.passengersProfile[index].profileForm = null;
            }

        };

        $scope.copyPassengerAddress = function (templateIndex, targetIndex) {
            console.log(templateIndex + ':' + targetIndex);
            if (!$scope.travel.applicationList[targetIndex]) {
                $scope.travel.applicationList[targetIndex] = {};
            }
            $scope.tempData.passengersProfile[targetIndex].referenceAddress = templateIndex;
            $scope.travel.applicationList[targetIndex].address = angular.copy($scope.travel.applicationList[templateIndex].address);
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
            $scope.tempData.passengersProfile[profileId].beneficiaries -= 1;
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
                if ($scope.tempData.destinations[i].type == "schengen") {
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
                if ($scope.tempData.destinations[i].type == "asia") {
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
                    if ($scope.tempData.destinations[i].type == "world wide") {
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

        $scope.submitOrder = function ($event, isFormValid) {
            // set to true to show all error messages (if there are any)
            $scope.formStepSubmitted = true;
            if (isFormValid) {
                $scope.formStepSubmitted = false;
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
                self.restartTimer()
                $scope.tempData.promotion = response.data.promotion;
                if ($scope.tempData.promotion.promoFull === 'Y') {

                    deferred.reject(response);

                    $scope.travel.promoCode = null;
                    dialogs.error('Warning', MESSAGES['promotion_reached_max_usage']);
                } else {
                    deferred.resolve(response);
                }
            }, function () {
                $scope.travel.promoCode = null;
            });

            return deferred.promise;
        };

        $scope.goToPlanSelection = function ($event, isFormValid) {
            //$event.preventDefault();
            //$event.stopPropagation();
            // set to true to show all error messages (if there are any)
            $scope.formStepSubmitted = true;

            if (isFormValid) {
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
            $scope.formStepSubmitted = true;

            if (isFormValid) {
                //Store data to session storage before payment
                LocalStorage.update('insurance.travel', $scope.travel);
                LocalStorage.update('insurance.travelData', $scope.travelData);
                LocalStorage.update('insurance.tempData', $scope.tempData);

                QueryService.query('POST', 'submitOrder', undefined, $scope.travel).then(function (response) {
                    $scope.formStepSubmitted = false;
                    $scope.tempData.referenceId = response.data.referenceId;
                    $state.go('^.payment');
                });
            }
        };

        $scope.goToProfile = function (isFormValid) {
            // set to true to show all error messages (if there are any)
            $scope.formStepSubmitted = true;

            if (isFormValid) {
                $scope.formStepSubmitted = false;
                $state.go('^.profile');
                if(!$scope.travel.applicationList)
                    $scope.passengersChange();
            }
        };

        $scope.confirmPlanSelected = function ($event, isFormValid) {
            //$event.preventDefault();
            //$event.stopPropagation();
            $scope.formStepSubmitted = true;
            if (isFormValid) {
                var hasVoluntary = false;
                for (var i = 0, len = $scope.travel.voluntaryList.length; i < len; ++i) {
                    var voluntary = $scope.travel.voluntaryList[i];
                    hasVoluntary = hasVoluntary || voluntary.topicDetail;
                }
                if ($scope.travel.voluntaryList.length > 1 && hasVoluntary) {
                    $scope.goToProfile(isFormValid);
                } else {
                    var dlg = dialogs.confirm('Warning', MESSAGES['privilege_voluntary']);
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

        $scope.range = function (min, max, step) {
            step = step || 1;
            var input = [];
            for (var i = min; i <= max; i += step) input.push(i);
            return input;
        };

        $scope.addDestination = function () {
            if ($scope.tempData.destinations) {
                if ($scope.tempData.destinations.length < 10) {
                    $scope.tempData.destinations.push($scope.tempData.destination);
                    $scope.travelData.destinationList = $filter('filter')($scope.travelData.destinationList, {country: "!" + $scope.tempData.destination.country}, true);
                    $scope.tempData.destination = "";
                    $scope.travel.destination = $scope.getProtectionArea();
                    $scope.travel.country = _.pluck($scope.tempData.destinations, 'country').join('|')
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
            var oneDay = 24 * 60 * 60 * 1000;
            $scope.travel.days = Math.floor(( Date.parse($scope.tempData.endDateForCal) - Date.parse($scope.tempData.startDateForCal) ) / oneDay);
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
                            $scope.tempData.cardType = card;
                            return card;
                        }
                    }
                    return false;
                }
            };
        })();
    }

})();
