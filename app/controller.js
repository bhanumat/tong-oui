/**
* Main application controller
*
* You can use this controller for your whole app if it is small
* or you can have separate controllers for each logical section
*
*/
;(function() {

  angular
  .module('cignaApp')
  .controller('MainController', MainController);

  MainController.$inject = [
    '$scope','$http', '$parse','parallaxHelper', '$filter', '$timeout', '$location', '$state','$sce', '$q',
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
    };

    // comment for testing

    $scope.$on('$locationChangeStart', function(next, current) {
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
    // $scope.travel = {
    //   destinations: [],
    //   passengers: 1
    // };

    $scope.tempData = {};
    $scope.tempData.destination = [];
    $scope.tempData.option1IsCollapsed = false;
    $scope.tempData.option2IsCollapsed = false;
    $scope.tempData.promotionValue = 50;
    $scope.tempData.promotionType = "discountPercent";
    $scope.formStepSubmitted = false;
    $scope.tempData.currentState = $location.path();
    $scope.tempData.passengersProfile = [];
    $scope.tempData.passengersProfile[1] = {};
    $scope.tempData.passengersProfile[1].stage = "edit";
    $scope.tempData.passengersProfile[1].isManualAddress = true;
    $scope.tempData.isShowingDiscount = false;
    $scope.translatey = 'translatey(12.5%)';

    QueryService.query('GET', 'NewTravel').then(function(response) {
      $scope.travelData = response.data;
      $scope.travel = {
        selectedPlan: $scope.travelData.quotation.defaultPlanid,
        flightSecured: $scope.travelData.flightsecure.defaultTick,
        propertySafe: $scope.travelData.propertysafe.defaultTick,
        destinations: [],
        passengers: 1
      };

      $scope.tempData.passengers = $scope.range(1,$scope.travelData.maxTraveller);
      $scope.isSchengen();
    }, function(response) {});

    //TODO: temporary commented, will be uncomment later
    // QueryService.query('POST', 'loadInitial').then(function(response) {
    //   $scope.travelData = response.data;
    //   $scope.tempData.passengers = $scope.range(1,$scope.travelData.maxTraveller);
    //   $scope.isSchengen();
    // }, function(response) {});

    QueryService.query('POST', 'getToken').then(function(response){
      $scope.travel.tokenCode = response.data.tokenCode;
    });

    $scope.$watch('travel.days', function() {
      if($location.path() == '/insurance/profile' || $location.path() == '/insurance/payment'){
        $location.path('/insurance/plan');
        $location.replace();
      }
    });

    $scope.$watch('travel.passengers', function() {
      if($location.path() == '/insurance/payment'){
        $location.path('/insurance/profile');
        $location.replace();
      }
    });

    $scope.calculateTotalPrice = function(){
      console.log('calculateTotalPrice');
      if( $scope.travelData.quotation) {
        for (var i=0;i<$scope.travelData.quotation.protections.length;i++) {
          if($scope.travelData.quotation.protections[i].planid == $scope.travel.selectedPlan){
            $scope.tempData.totalPrice = $scope.getPriceRate($scope.travelData.quotation.protections[i]);
            if($scope.travel.flightSecured) {
              $scope.tempData.totalPrice += $scope.getPriceRate($scope.travelData.flightsecure.protections[i]);
            }
            if($scope.travel.propertySafe) {
              $scope.tempData.totalPrice += $scope.getPriceRate($scope.travelData.propertysafe.protections[i]);
            }
            $scope.tempData.totalPrice *= $scope.travel.passengers;
          }
        }
      }
    };

    $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
    };

    $scope.editSummarybar = function(isFormValid){
      $scope.summaryBarSubmitted = true;
      if(!$scope.editingSummarybar) {
        $scope.editingSummarybar = true;
      }
      else {
        if(isFormValid) {
          if($scope.tempData.promoCodeChanged) {
            $scope.goToPlanSelection(isFormValid);
          } else {
            $scope.calculatePrice();
            $scope.summaryBarSubmitted = false;
          }

          $scope.editingSummarybar = false;
        }
      }
    };

    $scope.checkPromotionCodeChange = function() {
        $scope.tempData.promoCodeChanged = $scope.tempData.promoCode !== $scope.travel.promoCode
    };

    $scope.calculatePrice = function(){
      $scope.calculateTotalPrice();
      if($scope.tempData.promotionValue){
        if ($scope.tempData.promotionType == "discountPercent") {
          if($scope.tempData.totalPrice * ((100-$scope.tempData.promotionValue)/100) < 0 ){
            $scope.tempData.price = 0;
          }
          $scope.tempData.price = $scope.tempData.totalPrice * ((100-$scope.tempData.promotionValue)/100);
        }
        else if ($scope.tempData.promotionType == "discountAmount") {
          if(($scope.tempData.totalPrice - $scope.tempData.promotionValue) < 0 ){
            $scope.tempData.price = 0;
          }
          $scope.tempData.price = $scope.tempData.totalPrice - $scope.tempData.promotionValue;
        }
        else if ($scope.tempData.promotionType == "gift"){
          $scope.tempData.price = $scope.tempData.totalPrice;
        }
        $scope.tempData.discountAsAmount = $scope.tempData.totalPrice - $scope.tempData.price;
      }
      else {
        $scope.tempData.price = $scope.tempData.totalPrice;
      }
    };

    $scope.changeStage = function(index,stage,validate){
      if(!$scope.tempData.passengersProfile[index]) {
        $scope.tempData.passengersProfile[index] = {};
        $scope.tempData.passengersProfile[index].stage = '';
        $scope.tempData.passengersProfile[index].profileFormSubmitted = false;
        $scope.travel.passengersProfile[index] = {}
        $scope.travel.passengersProfile[index].birthDate = '';
      }
      if(stage == 'edit') {
        $scope.tempData.passengersProfile[index].profileFormSubmitted = false;
        $scope.tempData.passengersProfile[index].stage = stage;
        $scope.tempData.passengersProfile[index].profileForm = null;
      }
      if(stage == 'saved') {
        $scope.tempData.passengersProfile[index].profileFormSubmitted = true;
        if(validate){
          $scope.tempData.passengersProfile[index].profileFormSubmitted = false;
          $scope.tempData.passengersProfile[index].profileForm = true;
          $scope.tempData.passengersProfile[index].stage = stage;
        }
      }
      if(stage == 'reset') {
        $scope.tempData.passengersProfile[index].profileFormSubmitted = false;
        $scope.travel.passengersProfile[index] = {};
        $scope.tempData.passengersProfile[index].termsAccepted = false;
        $scope.tempData.passengersProfile[index].stage = "";
        $scope.tempData.passengersProfile[index].profileForm = null;
      }

    }

    $scope.copyPassengerAddress = function(templateIndex,targetIndex){
      if (!$scope.travel.passengersProfile[targetIndex]) {
        $scope.travel.passengersProfile[targetIndex] = {};
      }
      $scope.tempData.passengersProfile[targetIndex].referenceAddress = templateIndex;
      $scope.travel.passengersProfile[targetIndex].addressData = {};
      $scope.travel.passengersProfile[targetIndex].addressData = $scope.travel.passengersProfile[templateIndex].addressData;
    };

    $scope.addAddress = function(index) {
      $scope.tempData.passengersProfile[index].isManualAddress = true;
      $scope.travel.passengersProfile[index].addressData = {};
    };

    $scope.addBeneficiary = function(index,validate) {
      if($scope.tempData.passengersProfile[index].beneficiaries){
        if (validate) {
          $scope.beneficiaryFormSubmitted = false;
          if($scope.tempData.passengersProfile[index].beneficiaries < 3) {
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

    $scope.deleteBeneficiary = function(profileId,beneficiaryId) {
      $scope.tempData.passengersProfile[profileId].beneficiaries -= 1;
      for (var i = beneficiaryId; i < 3; i++) {
        if($scope.travel.passengersProfile[profileId].beneficiaries[i+1]){
          $scope.travel.passengersProfile[profileId].beneficiaries[i] = $scope.travel.passengersProfile[profileId].beneficiaries[i+1];
          $scope.travel.passengersProfile[profileId].beneficiaries[i+1] = {};
        }
        else {
          $scope.travel.passengersProfile[profileId].beneficiaries[i] = {};
        }
      };
      $scope.beneficiaryFormSubmitted = false;
    };



    $scope.isSchengen = function(){
      for (var i = 0; i < $scope.travel.destinations.length; i++) {
        if($scope.travel.destinations[i].type == "schengen"){
          $scope.tempData.isSchengen = true;
          return true;
        }
        else {
          $scope.tempData.isSchengen = false;
        }
      }
      return false;
    };

    $scope.isAsia = function(){
      for (var i = 0; i < $scope.travel.destinations.length; i++) {
        if($scope.travel.destinations[i].type == "asia"){
          $scope.tempData.isAsia = true;
          return true;
        }
        else {
          $scope.tempData.isAsia = false;
        }
      }
      return false;
    };

    $scope.isWorldWide = function(){
      if( $scope.isSchengen() && $scope.isAsia() ) {
        return true;
      }
      return false;
    };

    $scope.getProtectionArea = function(){
      if($scope.isWorldWide()) {
        return 'world';
      }
      else if($scope.isAsia()) {
        return 'asia';
      }
      else {
        return 'schengen';
      }
      return false;
    };

    $scope.getPriceRate = function(plan){
      var price = 0;
      for(var i = 0; i < plan.price[$scope.getProtectionArea()].length - 1; i++) {
        if(plan.price[$scope.getProtectionArea()][i].day < $scope.travel.days){
          price = plan.price[$scope.getProtectionArea()][i+1].fee;
        }
        else if(plan.price[$scope.getProtectionArea()][i].day == $scope.travel.days){
          price = plan.price[$scope.getProtectionArea()][i].fee;
          return price;

        }
      }
      return price;
    };

    $scope.propertySafeToggle = function(selected){
      if(selected){
        $scope.travel.propertySafe = !$scope.travel.propertySafe;
        $scope.calculatePrice();
      };
    };

    $scope.termsToggle = function(index){
      if(!$scope.tempData.passengersProfile[index].termsAccepted) {
        $scope.tempData.passengersProfile[index].termsAccepted = true;
      }
      else {
        $scope.tempData.passengersProfile[index].termsAccepted = false;
      }
      // console.log($scope.tempData.passengersProfile[index].termsAccepted);
    };


    $scope.flightSecuredToggle = function(selected){
      if (selected) {
        $scope.travel.flightSecured = !$scope.travel.flightSecured;
        $scope.calculatePrice();
      };
    };

    $scope.processForm = function() {
    }

    $scope.goToOrder = function(isFormValid) {
      // set to true to show all error messages (if there are any)
      $scope.formStepSubmitted = true;
      if(isFormValid) {
        $scope.formStepSubmitted = false;
        $state.go('^.thankyou');
      }
    };

    $scope.goToPlanSelection = function(isFormValid) {
      // set to true to show all error messages (if there are any)
      $scope.formStepSubmitted = true;

      if(isFormValid) {
        if($scope.tempData.promoCode) {
           $scope.travel.promoCode = $scope.tempData.promoCode;
           var validatePromoCodeParams = {
              tokenCode: $scope.travel.tokenCode,
              promoCode: $scope.travel.promoCode
           };
          //validate promotion code if any
          QueryService.query('POST', 'validatePromoCode', validatePromoCodeParams,validatePromoCodeParams).then(function(response){
            $scope.tempData.promotion = response.data.promotion;
            if( $scope.tempData.promotion.promoFull==='Y') {
              $scope.travel.promoCode=null;
              var modalServiceOptions = {
                  message : MESSAGES['promotion_reached_max_usage']
              };
              ModalService.showWarning(modalServiceOptions);
            } else {
              self.getCoverageTable().then(function(response){
                $scope.calculatePrice();
                $scope.formStepSubmitted = false;

                //Store travel data to session
                SessionStorage.update('travel', $scope.travel);
                SessionStorage.update('travelData', $scope.travelData);
                SessionStorage.update('tempData', $scope.tempData);
                if( $scope.tempData.currentState === '/insurance/destination') {
                  $state.go('^.plan');
                }
              });
            }
          }, function(response) {
            $scope.travel.promoCode=null;
          });
        } else {
          self.getCoverageTable().then(function(response){
            $scope.calculatePrice();
            $scope.formStepSubmitted = false;

            //Store travel data to session
            SessionStorage.update('travel', $scope.travel);
            SessionStorage.update('travelData', $scope.travelData);
            SessionStorage.update('tempData', $scope.tempData);

            if( $scope.tempData.currentState === '/insurance/destination') {
              $state.go('^.plan');
            }
          });
        }
      }
    };

    $scope.goToPayment = function(isFormValid) {
      // set to true to show all error messages (if there are any)
      $scope.formStepSubmitted = true;

      if(isFormValid) {
        $scope.formStepSubmitted = false;
        $state.go('^.payment');
      }
    };

    $scope.goToProfile = function(isFormValid) {
      // set to true to show all error messages (if there are any)
      $scope.formStepSubmitted = true;
      if(isFormValid) {
        $scope.formStepSubmitted = false;
        $state.go('^.profile');
      }
    };

    $scope.selectPlan = function(planId){
      //plan ID = 3
      // console.log($scope.travelData.quotation.protections.length);
      $scope.travel.selectedPlan = planId;
      if(planId < 3) {
        $scope.translatey = 'translatey(12.5%)';
      }
      else if((planId > 2) && (planId < $scope.travelData.quotation.protections.length)){
        $scope.translatey = 'translatey('+ parseFloat(12.5-((planId-2)*25)) +'%)';
      }
      else if(planId == $scope.travelData.quotation.protections.length){
        $scope.translatey = 'translatey('+ parseFloat(12.5-((planId-3)*25)) +'%)';
      }
      $scope.calculatePrice();
    };

    $scope.range = function(min, max, step){
      step = step || 1;
      var input = [];
      for (var i = min; i <= max; i += step) input.push(i);
      return input;
    };

    $scope.addDestination = function() {
      if($scope.tempData.destination){
        if($scope.travel.destinations.length < 10){
          $scope.travel.destinations.push($scope.tempData.destination);
          $scope.travelData.destinationList = $filter('filter')($scope.travelData.destinationList, {country: "!"+$scope.tempData.destination.country}, true);
          $scope.tempData.destination = "";
          $scope.isSchengen();
        }
      }
    }

    $scope.removeDestination = function(index) {
      $scope.travelData.destinationList.push($scope.travel.destinations[index]);
      $scope.travel.destinations = $filter('filter')($scope.travel.destinations, {country: "!"+$scope.travel.destinations[index].country}, true);
      $scope.isSchengen();
    }

    //datepicker

    $scope.addDays = function(date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }


    $scope.calcTravelDays = function() {
      var oneDay = 24*60*60*1000;
      $scope.travel.days = Math.floor(( Date.parse($scope.tempData.endDateForCal) - Date.parse($scope.tempData.startDateForCal) ) / oneDay);
      $scope.tempData.daysAsText = "รวม "+$scope.travel.days+" วัน";
    }

    $scope.today = new Date();
    $scope.tempData.maxDate = $scope.addDays($scope.today,90);
    $scope.tempData.minDate = $scope.addDays($scope.today,1);

    //datepicker

    $scope.background = parallaxHelper.createAnimator(-0.05);

    /**
    * Load data from session if any
    */
    if( SessionStorage.get('travel')) {
      $scope.travel = SessionStorage.get('travel');
      $scope.travelData = SessionStorage.get('travelData');
      $scope.tempData = SessionStorage.get('tempData');
//      $scope.calculatePrice();
    }

    self.getCoverageTable = function() {
      var deferred = $q.defer();
      var area = $scope.getProtectionArea();
      var getCoverageTableParams = {
        tokenCode: $scope.travel.tokenCode,
        area : area,
        days : $scope.travel.days,
        promoCode: $scope.travel.promoCode
      };

      QueryService.query('POST', 'getCoverageTable', getCoverageTableParams, getCoverageTableParams)
      .then(function(response) {
  //        TODO: Uncomment below when API is ready.
  //        $scope.travelData.quotation['protections'] = response.data.premium;
        deferred.resolve(response);
      }, function (response){
        deferred.reject(response);
      });

      return deferred.promise;
    };

  }

})();
