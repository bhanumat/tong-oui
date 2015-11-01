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
        'CONSTANTS', 'MESSAGES', 'SessionStorage', 'QueryService', 'ModalService'
    ];


    function MainController($scope, $http, $parse, parallaxHelper, $filter, $timeout, $location, $state, $sce, $q, CONSTANTS, MESSAGES, SessionStorage, QueryService, ModalService) {

        // 'controller as' syntax
        var self = this;

        ////////////  function definitions

        $scope.start = true;
        if ($scope.start == true) {
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
            else {
                $scope.tempData.currentState = $location.path();
            }
        });

        //Travel Model to post back to API
        $scope.travel = {
            destinations: [],
            passengers: 1
        };

        $scope.tempData = {};
        $scope.tempData.voluntaryCollapse = [];
        $scope.tempData.destination = [];
        $scope.tempData.promotion = {
            "promoType": null,
            "promoValue": null,
            "promoFull": null
        };
        $scope.formStepSubmitted = false;
        $scope.tempData.currentState = $location.path();
        $scope.tempData.passengersProfile = [];
        $scope.tempData.passengersProfile[1] = {};
        $scope.tempData.passengersProfile[1].stage = "edit";
        $scope.tempData.passengersProfile[1].isManualAddress = true;
        $scope.tempData.isShowingDiscount = false;
        $scope.translatey = 'translatey(12.5%)';

        //QueryService.query('GET', 'NewTravel').then(function (response) {
        //    $scope.travelData = response.data;
        //    $scope.travel = {
        //        selectedPlan: $scope.travelData.quotation.defaultPlanid,
        //        flightSecured: $scope.travelData.flightsecure.defaultTick,
        //        propertySafe: $scope.travelData.propertysafe.defaultTick,
        //        destinations: [],
        //        passengers: 1
        //    };
        //
        //    $scope.tempData.passengers = $scope.range(1, $scope.travelData.maxTraveller);
        //    $scope.isSchengen();
        //}, function (response) {
        //});

        //TODO: temporary commented, will be uncomment later
        QueryService.query('POST', 'loadInitial').then(function (response) {
            $scope.travelData = response.data;
            $scope.tempData.passengers = $scope.range(1, $scope.travelData.maxTraveller);
            $scope.isSchengen();
        }, function (response) {
        });

        QueryService.query('POST', 'getToken').then(function (response) {
            $scope.travel.tokenCode = response.data.tokenCode;
        });

        $scope.$watch('travel.days', function () {
            if ($location.path() == '/insurance/profile' || $location.path() == '/insurance/payment') {
                $location.path('/insurance/plan');
                $location.replace();
            }
        });

        $scope.$watch('travel.passengers', function () {
            if ($location.path() == '/insurance/payment') {
                $location.path('/insurance/profile');
                $location.replace();
            }
        });

        $scope.trustAsHtml = function (string) {
            return $sce.trustAsHtml(string);
        };

        $scope.editSummarybar = function (isFormValid) {
            $scope.summaryBarSubmitted = true;
            if (!$scope.editingSummarybar) {
                $scope.editingSummarybar = true;
            }
            else {
                if (isFormValid) {
                    if ($scope.tempData.promoCodeChanged) {
                        $scope.goToPlanSelection(isFormValid);
                    } else {
                        $scope.calculatePrice();
                        $scope.summaryBarSubmitted = false;
                    }

                    $scope.editingSummarybar = false;
                }
            }
        };

        $scope.checkPromotionCodeChange = function () {
            $scope.tempData.promoCodeChanged = $scope.tempData.promoCode !== $scope.travel.promoCode
        };

        $scope.getPriceRate = function (plan) {
            var price = 0;
            if (plan && plan.rateScale) {//if any
                price = plan.rateScale.price;
            }
            return price;
        };

        $scope.calculateTotalPrice = function () {
            if ($scope.travelData.campaignList) {
                $scope.tempData.totalPrice = $scope.getPriceRate($scope.travel.campaign.mandatory);
                for (var i = 0, len = $scope.travel.campaign.voluntaryList.length; i < len; ++i) {
                    var voluntary = $scope.travel.campaign.voluntaryList[i];
                    $scope.tempData.totalPrice += $scope.getPriceRate(voluntary);
                }
                $scope.tempData.totalPrice *= $scope.travel.passengers;
            }
        };

        self.setupCampaign = function (campaign) {
            $scope.travel.campaign = {
                campaignCode: campaign.campaignCode
            };

            //Mandatory
            var foundDefaultRateScale;
            var foundIndexRateScale;
            for (var i = 0, len = campaign.mandatory.rateScaleList.length; i < len; ++i) {
                var rateScale = campaign.mandatory.rateScaleList[i];
                if (rateScale.defaultFlag) {
                    foundDefaultRateScale = true;
                    foundIndexRateScale = i;
                    $scope.tempData.selectedPlanIndex = i;
                    $scope.travel.campaign.mandatory = {
                        topicDetail: campaign.mandatory.topicDetail,
                        coverageList: campaign.mandatory.coverageList,
                        rateScale: rateScale
                    }
                    break;
                }
            }

            //Fix invalid info from API if any
            if (!foundDefaultRateScale) {//Use first item as default
                $scope.tempData.selectedPlanIndex = 0;
                foundIndexRateScale = 0;
                $scope.travel.campaign.mandatory = {
                    topicDetail: campaign.mandatory.topicDetail,
                    coverageList: campaign.mandatory.coverageList,
                    rateScale: campaign.mandatory.rateScaleList[0]
                }
            }


            //Voluntary if any
            $scope.travel.campaign.voluntaryList = [];
            for (var i = 0, len = campaign.voluntaryList.length; i < len; ++i) {
                var foundDefaultRateScale = false;
                var voluntary = campaign.voluntaryList[i];
                for (var j = 0, rateScaleLen = voluntary.rateScaleList.length; j < rateScaleLen; ++j) {
                    var rateScale = voluntary.rateScaleList[j];
                    if (rateScale.defaultFlag) {
                        foundDefaultRateScale = true;
                        $scope.travel.campaign.voluntaryList.push({
                            topicDetail: voluntary.topicDetail,
                            coverageList: voluntary.coverageList,
                            rateScale: rateScale
                        });
                        break;
                    }
                }
                //Fix invalid info from API if any
                if (!foundDefaultRateScale) {//Use first item as default
                    $scope.travel.campaign.voluntaryList.push({
                        topicDetail: voluntary.topicDetail,
                        coverageList: voluntary.coverageList,
                        rateScale: voluntary.rateScaleList[foundIndexRateScale]
                    });
                }
            }

        };

        self.initDefaultCampaign = function () {
            var campaigns = $scope.travelData.campaignList;
            if (!$scope.travel.campaign) {
                var foundDefault;
                for (var i = 0, len = campaigns.length; i < len; ++i) {
                    var campaign = campaigns[i];
                    if (campaign.defaultFlag) {
                        foundDefault = true;
                        self.setupCampaign(campaign);
                        break;
                    }
                }
                if (!foundDefault) {
                    self.setupCampaign(campaigns[0]);
                }
            }
        };

        $scope.calculatePrice = function () {
            $scope.calculateTotalPrice();
            if ($scope.tempData.promotion.promoValue) {
                var netPrice = 0;
                if ($scope.tempData.promotion.promoType == "percent") {
                    netPrice = $scope.tempData.totalPrice * ((100 - $scope.tempData.promotion.promoValue) / 100);
                } else if ($scope.tempData.promotion.promoType == "amount") {
                    netPrice = $scope.tempData.totalPrice - $scope.tempData.promotion.promoValue;
                } else if ($scope.tempData.promotion.promoType == "gift") {
                    netPrice = $scope.tempData.totalPrice;
                }

                $scope.tempData.price = netPrice < 0 ? 0 : netPrice;
                $scope.tempData.discountAsAmount = $scope.tempData.totalPrice - $scope.tempData.price;
            }
            else {
                $scope.tempData.price = $scope.tempData.totalPrice;
            }
        };

        $scope.changeStage = function (index, stage, validate) {
            if (!$scope.tempData.passengersProfile[index]) {
                $scope.tempData.passengersProfile[index] = {};
                $scope.tempData.passengersProfile[index].stage = '';
                $scope.tempData.passengersProfile[index].profileFormSubmitted = false;
                $scope.travel.passengersProfile[index] = {}
                $scope.travel.passengersProfile[index].birthDate = '';
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
                $scope.travel.passengersProfile[index] = {};
                $scope.tempData.passengersProfile[index].termsAccepted = false;
                $scope.tempData.passengersProfile[index].stage = "";
                $scope.tempData.passengersProfile[index].profileForm = null;
            }

        };

        $scope.copyPassengerAddress = function (templateIndex, targetIndex) {
            if (!$scope.travel.passengersProfile[targetIndex]) {
                $scope.travel.passengersProfile[targetIndex] = {};
            }
            $scope.tempData.passengersProfile[targetIndex].referenceAddress = templateIndex;
            $scope.travel.passengersProfile[targetIndex].addressData = {};
            $scope.travel.passengersProfile[targetIndex].addressData = $scope.travel.passengersProfile[templateIndex].addressData;
        };

        $scope.addAddress = function (index) {
            $scope.tempData.passengersProfile[index].isManualAddress = true;
            $scope.travel.passengersProfile[index].addressData = {};
        };

        $scope.addBeneficiary = function (index, validate) {
            if ($scope.tempData.passengersProfile[index].beneficiaries) {
                if (validate) {
                    $scope.beneficiaryFormSubmitted = false;
                    if ($scope.tempData.passengersProfile[index].beneficiaries < 3) {
                        $scope.tempData.passengersProfile[index].beneficiaries += 1;
                    }
                }
                else {
                    $scope.beneficiaryFormSubmitted = true;
                }
            }
            else {
                $scope.tempData.passengersProfile[index].beneficiaries = 1;
            }
        };

        $scope.deleteBeneficiary = function (profileId, beneficiaryId) {
            $scope.tempData.passengersProfile[profileId].beneficiaries -= 1;
            for (var i = beneficiaryId; i < 3; i++) {
                if ($scope.travel.passengersProfile[profileId].beneficiaries[i + 1]) {
                    $scope.travel.passengersProfile[profileId].beneficiaries[i] = $scope.travel.passengersProfile[profileId].beneficiaries[i + 1];
                    $scope.travel.passengersProfile[profileId].beneficiaries[i + 1] = {};
                }
                else {
                    $scope.travel.passengersProfile[profileId].beneficiaries[i] = {};
                }
            }
            ;
            $scope.beneficiaryFormSubmitted = false;
        };

        $scope.isSchengen = function () {
            for (var i = 0; i < $scope.travel.destinations.length; i++) {
                if ($scope.travel.destinations[i].type == "schengen") {
                    $scope.tempData.isSchengen = true;
                    return true;
                }
                else {
                    $scope.tempData.isSchengen = false;
                }
            }
            return false;
        };

        $scope.isAsia = function () {
            for (var i = 0; i < $scope.travel.destinations.length; i++) {
                if ($scope.travel.destinations[i].type == "asia") {
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
                for (var i = 0; i < $scope.travel.destinations.length; i++) {
                    if ($scope.travel.destinations[i].type == "world wide") {
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
                if ($scope.travel.campaign.voluntaryList[voluntaryIndex].rateScale) {//existing
                    //Currently, no id for voluntary. So, cannot remove item it will cause index invalid.
                    $scope.travel.campaign.voluntaryList[voluntaryIndex] = {};
                } else {
                    var voluntary = $scope.travelData.campaignList[campaignIndex].voluntaryList[voluntaryIndex];
                    $scope.travel.campaign.voluntaryList[voluntaryIndex] = {
                        topicDetail: voluntary.topicDetail,
                        coverageList: voluntary.coverageList,
                        rateScale: voluntary.rateScaleList[rateScaleIndex]
                    };//Restore
                }

                $scope.calculatePrice();
            }
        };

        $scope.processForm = function () {
        };

        $scope.goToOrder = function (isFormValid) {
            // set to true to show all error messages (if there are any)
            $scope.formStepSubmitted = true;
            if (isFormValid) {
                $scope.formStepSubmitted = false;
                $state.go('^.thankyou');
            }
        };

        $scope.goToPlanSelection = function (isFormValid) {
            // set to true to show all error messages (if there are any)
            $scope.formStepSubmitted = true;

            if (isFormValid) {
                if ($scope.tempData.promoCode) {
                    $scope.travel.promoCode = $scope.tempData.promoCode;
                    var validatePromoCodeParams = {
                        tokenCode: $scope.travel.tokenCode,
                        promoCode: $scope.travel.promoCode
                    };
                    //validate promotion code if any
                    QueryService.query('POST', 'validatePromoCode', validatePromoCodeParams, validatePromoCodeParams).then(function (response) {
                        $scope.tempData.promotion = response.data.promotion;
                        if ($scope.tempData.promotion.promoFull === 'Y') {
                            $scope.travel.promoCode = null;
                            var modalServiceOptions = {
                                message: MESSAGES['promotion_reached_max_usage']
                            };
                            ModalService.showWarning(modalServiceOptions);
                        } else {
                            self.getCoverageTable().then(function (response) {
                                $scope.calculatePrice();
                                $scope.formStepSubmitted = false;

                                //Store travel data to session
                                //SessionStorage.update('travel', $scope.travel);
                                //SessionStorage.update('travelData', $scope.travelData);
                                //SessionStorage.update('tempData', $scope.tempData);
                                if ($scope.tempData.currentState === '/insurance/destination') {
                                    $state.go('^.plan');
                                }
                            });
                        }
                    }, function (response) {
                        $scope.travel.promoCode = null;
                    });
                } else {
                    self.getCoverageTable().then(function (response) {
                        $scope.calculatePrice();
                        $scope.formStepSubmitted = false;

                        //Store travel data to session
                        //SessionStorage.update('travel', $scope.travel);
                        //SessionStorage.update('travelData', $scope.travelData);
                        //SessionStorage.update('tempData', $scope.tempData);

                        if ($scope.tempData.currentState === '/insurance/destination') {
                            $state.go('^.plan');
                        }
                    });
                }
            }
        };

        $scope.goToPayment = function (isFormValid) {
            // set to true to show all error messages (if there are any)
            $scope.formStepSubmitted = true;

            if (isFormValid) {
                $scope.formStepSubmitted = false;
                $state.go('^.payment');
            }
        };

        $scope.goToProfile = function (isFormValid) {
            // set to true to show all error messages (if there are any)
            $scope.formStepSubmitted = true;

            if (isFormValid) {
                $scope.formStepSubmitted = false;
                $state.go('^.profile');
            }
        };

        $scope.confirmPlanSelected = function(isFormValid) {
            $scope.formStepSubmitted = true;
            if( isFormValid) {
                var hasVoluntary = false;
                for( var i= 0, len=$scope.travel.campaign.voluntaryList.length; i< len;++i) {
                    var voluntary = $scope.travel.campaign.voluntaryList[i];
                    hasVoluntary = hasVoluntary || voluntary.topicDetail;
                }
                if( $scope.travel.campaign.voluntaryList.length>1 &&  hasVoluntary ) {
                    $scope.goToProfile(isFormValid);
                } else {
                    var modalServiceOptions = {
                        btnClose : 'ใช่.. ข้าพเจ้าต้องการเพิ่มความคุ้มครองเสริม ',
                        btnPrimary : 'ไม่.. ดำเนินการต่อโดยไม่เพิ่มความคุ้มครอง ',
                        title : 'Confirmation',
                        message: MESSAGES['privilege_voluntary']
                    };
                    var modalPromise = ModalService.showConfirm(modalServiceOptions);
                    modalPromise.then(function() {// yes
                        $scope.goToProfile(isFormValid);
                    });
                }
            }
        }

        $scope.isRateScaleSameAsSelected = function (rateScale) {
            if (rateScale)
                return rateScale.code == $scope.travel.campaign.mandatory.rateScale.code;
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
                //Set mandatory selected
                if (rateScale) {
                    $scope.travel.campaign.mandatory.rateScale = rateScale;
                } else {
                    $scope.travel.campaign.mandatory.rateScale = campaign.mandatory.rateScaleList[rateScaleIndex];
                }

                //Set voluntaries selected
                for (var i = 0, len = campaign.voluntaryList.length; i < len; ++i) {
                    var voluntary = campaign.voluntaryList[i];
                    $scope.travel.campaign.voluntaryList[i] = {
                        topicDetail: voluntary.topicDetail,
                        coverageList: voluntary.coverageList,
                        rateScale: voluntary.rateScaleList[rateScaleIndex]
                    }
                }

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
            if ($scope.tempData.destination) {
                if ($scope.travel.destinations.length < 10) {
                    $scope.travel.destinations.push($scope.tempData.destination);
                    $scope.travelData.destinationList = $filter('filter')($scope.travelData.destinationList, {country: "!" + $scope.tempData.destination.country}, true);
                    $scope.tempData.destination = "";
                    $scope.isSchengen();
                }
            }
        };

        $scope.removeDestination = function (index) {
            $scope.travelData.destinationList.push($scope.travel.destinations[index]);
            $scope.travel.destinations = $filter('filter')($scope.travel.destinations, {country: "!" + $scope.travel.destinations[index].country}, true);
            $scope.isSchengen();
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

        /**
         * Load data from session if any
         */
        if (SessionStorage.get('travel')) {
            $scope.travel = SessionStorage.get('travel');
            $scope.travelData = SessionStorage.get('travelData');
            $scope.tempData = SessionStorage.get('tempData');
        }

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
                    //TODO: Uncomment below when API is ready.
                    $scope.travelData.campaignList = response.data.campaignList;
                    self.initDefaultCampaign();
                    deferred.resolve(response);
                }, function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

    }

})();
