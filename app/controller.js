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

    $scope.start = true;
    if ($scope.start == true) {
      $scope.start = false;
      $location.path('/insurance/destination');
      $location.replace();
    }
    
    $scope.$on('$locationChangeStart', function(next, current) { 
     if ($location.path() == '/insurance') {
        $location.path('/insurance/destination');
        $location.replace();
      }
    });
    

    $http.get('/NewTravel.json').
    then(function(response) {
      $scope.travelData = response.data.cignatravel;
      
    }, function(response) {
      
    });

    $scope.travel = {
      destinations: []
    };
    $scope.tempData = {
      destination: []
    };
    $scope.formStepSubmitted = false;

    $scope.goToPlanSelection=function(isFormValid) {
      // set to true to show all error messages (if there are any)
      $scope.formStepSubmitted = true;
      if(isFormValid) {
        $scope.formStepSubmitted = false;
        $state.go('^.plan');
      }
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