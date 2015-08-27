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

    $scope.items = [
            { 
              title: 'Title 1',
              description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit',
              description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit Lorem ipsum dolor sit amet, consectetur adipisicing elit'
            },
            { 
              title: 'Title 2',
              description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur..',
              description2: 'Lorem ipsum dolor sit amet,Lorem ipsum dolor sit amet,Lorem ipsum dolor sit amet,Lorem ipsum dolor sit amet,Lorem ipsum dolor sit amet,Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur..'
            },
            { 
              title: 'Title 3',
              description: 'Lorem ipsum dolor sit amet',
              description2: 'Lorem ipsum dolor sit amet'
            },
          ];
    
    $scope.tempData = {};
    $scope.tempData.destination = [];
    $scope.tempData.daysAsText = "รวม 25 วัน";
    $scope.tempData.shortStartDate = "28 ส.ค. 2015";
    $scope.tempData.shortEndDate = "22 ก.ย. 2015";
    $scope.tempData.option1IsCollapsed = false;
    $scope.tempData.option2IsCollapsed = false;
    $scope.tempData.discount = 50;
    $scope.tempData.discountType = "percent";
    $scope.formStepSubmitted = false;
    $scope.tempData.currentState = $location.path();

    $http.get('/NewTravel.json').
    then(function(response) {
      $scope.travelData = response.data.cignatravel;
      $scope.tempData.passengers = $scope.range(1,$scope.travelData.maxtraveller);
      $scope.travel = {
        destinations:[{"country":"Argentina","code":"AR","id":1,"type":"schengen"},{"country":"Australia","code":"AU","id":2,"type":"schengen"},{"country":"Belgium","code":"BE","id":4,"type":"schengen"},{"country":"France","code":"FR","id":6,"type":"schengen"}],
        startDate: "28 สิงหาคม 2015",
        endDate: "22 กันยายน 2015",
        days: 25,
        passengers: 3,
        promotionCode: "Test Promo Code",
        selectedPlan: $scope.travelData.quotation.defaultPlanid,
        flightSecured: $scope.travelData.flightsecure.defaultTick,
        propertySafe: $scope.travelData.propertysafe.defaultTick
      };

      $scope.calculateTotalPrice();
      $scope.calculatePrice();

    }, function(response) {
      
    });


    $scope.calculateTotalPrice = function(){
      for (i=0;i<$scope.travelData.quotation.protect.length;i++) {
        if($scope.travelData.quotation.protect[i].planid == $scope.travel.selectedPlan){
          $scope.tempData.totalPrice = $scope.travelData.quotation.protect[i].price;
          if($scope.travel.flightSecured) {
            $scope.tempData.totalPrice += $scope.travelData.flightsecure.protect[i].price;
          }
          if($scope.travel.propertySafe) {
            $scope.tempData.totalPrice += $scope.travelData.propertysafe.protect[i].price;
          }
        }
      }
    };

    $scope.calculatePrice = function(){
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

    $scope.propertySafeToggle = function(){
      $scope.travel.propertySafe = !$scope.travel.propertySafe;
      $scope.calculateTotalPrice();
      $scope.calculatePrice();
    };

    $scope.flightSecuredToggle = function(){
      $scope.travel.flightSecured = !$scope.travel.flightSecured;
      $scope.calculateTotalPrice();
      $scope.calculatePrice();
    };

    $scope.goToPlanSelection = function(isFormValid) {
      // set to true to show all error messages (if there are any)
      $scope.formStepSubmitted = true;
      if(isFormValid) {
        $scope.formStepSubmitted = false;
        $state.go('^.plan');
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

    $scope.selectPlan = function(planId,price){
      $scope.travel.selectedPlan = planId;
      $scope.calculateTotalPrice();
      $scope.calculatePrice();
    }

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
        }
      }
    }

    $scope.removeDestination = function(index) {
      $scope.travelData.destination.push($scope.travel.destinations[index]);
      $scope.travel.destinations = $filter('filter')($scope.travel.destinations, {country: "!"+$scope.travel.destinations[index].country}, true);
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
    $scope.maxDate = $scope.addDays($scope.today,90);
    $scope.minDate = $scope.addDays($scope.today,1);

    //datepicker

    $scope.background = parallaxHelper.createAnimator(-0.05);

  }

})();