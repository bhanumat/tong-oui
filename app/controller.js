/**
 * Main application controller
 *
 * You can use this controller for your whole app if it is small
 * or you can have separate controllers for each logical section
 * 
 */
;(function() {

  angular
    .module('boilerplate')
    .controller('MainController', MainController);

  MainController.$inject = ['LocalStorage', 'QueryService', '$scope','$http', '$parse','parallaxHelper', '$filter', '$timeout', '$location', '$state'];


  function MainController(LocalStorage, QueryService, $scope, $http, $parse, parallaxHelper, $filter, $timeout, $location, $state) {

    // 'controller as' syntax
    var self = this;

    ////////////  function definitions

    // $scope.start = true;
    // if ($scope.start == true) {
    //   $scope.start = false;
    //   $location.path('/insurance/destination');
    //   $location.replace();
    // }
    
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
    
    $scope.tempData = {};
    $scope.tempData.destination = [];
    $scope.tempData.option1IsCollapsed = false;
    $scope.tempData.option2IsCollapsed = false;
    $scope.tempData.discount = 50;
    $scope.tempData.discountType = "percent";
    $scope.formStepSubmitted = false;
    $scope.tempData.currentState = $location.path();
    $scope.tempData.passengersProfile = [];
    $scope.tempData.passengersProfile[1] = {};
    $scope.tempData.passengersProfile[1].stage = "edit";
    $scope.tempData.passengersProfile[1].isManualAddress = true; 

    $http.get('/NewTravel.json').
    then(function(response) {
      $scope.travelData = response.data.cignatravel;
      $scope.tempData.passengers = $scope.range(1,$scope.travelData.maxtraveller);
      $scope.travel = {
        selectedPlan: $scope.travelData.quotation.defaultPlanid,
        flightSecured: $scope.travelData.flightsecure.defaultTick,
        propertySafe: $scope.travelData.propertysafe.defaultTick,
        destinations: []
      };

      $scope.calculatePrice();
      $scope.isSchengen();

    }, function(response) {
      
    });

    $scope.calculateTotalPrice = function(){
      for (var i=0;i<$scope.travelData.quotation.protect.length;i++) {
        if($scope.travelData.quotation.protect[i].planid == $scope.travel.selectedPlan){
          $scope.tempData.totalPrice = $scope.getPriceRate($scope.travelData.quotation.protect[i]);
          if($scope.travel.flightSecured) {
            $scope.tempData.totalPrice += $scope.getPriceRate($scope.travelData.flightsecure.protect[i]);
          }
          if($scope.travel.propertySafe) {
            $scope.tempData.totalPrice += $scope.getPriceRate($scope.travelData.propertysafe.protect[i]);
          }
          $scope.tempData.totalPrice *= $scope.travel.passengers;
        }
      }
    };

    $scope.editSummarybar = function(isFormValid){
      $scope.summaryBarSubmitted = true;
      if(!$scope.editingSummarybar) {
        $scope.editingSummarybar = true;
      }
      else {
        if(isFormValid) {
          $scope.calculatePrice();
          $scope.summaryBarSubmitted = false;
          $scope.editingSummarybar = false;
        }
      }
    };

    $scope.calculatePrice = function(){
      $scope.calculateTotalPrice();
      if($scope.tempData.discount){
        if ($scope.tempData.discountType == "percent") {
          if($scope.tempData.totalPrice * ((100-$scope.tempData.discount)/100) < 0 ){
            $scope.tempData.price = 0;
          }
          $scope.tempData.price = $scope.tempData.totalPrice * ((100-$scope.tempData.discount)/100);
        }
        else if ($scope.tempData.discountType == "direct") {
          if(($scope.tempData.totalPrice - $scope.tempData.discount) < 0 ){
            $scope.tempData.price = 0;
          }
          $scope.tempData.price = $scope.tempData.totalPrice - $scope.tempData.discount;
        }
        $scope.tempData.discountAsBath = $scope.tempData.totalPrice - $scope.tempData.price;
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
      console.log($scope.tempData.passengersProfile[index].termsAccepted);
    };


    $scope.flightSecuredToggle = function(selected){
      if (selected) {
        $scope.travel.flightSecured = !$scope.travel.flightSecured;
        $scope.calculatePrice();
      };
    };

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
        $scope.calculatePrice();
        $scope.formStepSubmitted = false;
        $state.go('^.plan');
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
      $scope.travel.selectedPlan = planId;
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
          $scope.travelData.destination = $filter('filter')($scope.travelData.destination, {country: "!"+$scope.tempData.destination.country}, true);
          $scope.tempData.destination = "";
          $scope.isSchengen();
        }
      }
    }

    $scope.removeDestination = function(index) {
      $scope.travelData.destination.push($scope.travel.destinations[index]);
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
      $scope.travel.days = (Math.floor(( Date.parse($scope.tempData.endDateForCal) - Date.parse($scope.tempData.startDateForCal) ) / oneDay));
      $scope.tempData.daysAsText = "รวม "+(Math.floor(( Date.parse($scope.tempData.endDateForCal) - Date.parse($scope.tempData.startDateForCal) ) / oneDay))+" วัน";
    }
   
    $scope.today = new Date();
    $scope.tempData.maxDate = $scope.addDays($scope.today,90);
    $scope.tempData.minDate = $scope.addDays($scope.today,1);

    //datepicker

    $scope.background = parallaxHelper.createAnimator(-0.05);

  }

})();