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

  MainController.$inject = ['LocalStorage', 'QueryService', '$scope','$http', '$parse','parallaxHelper', '$filter'];


  function MainController(LocalStorage, QueryService, $scope, $http, $parse, parallaxHelper, $filter) {

    // 'controller as' syntax
    var self = this;

    ////////////  function definitions

    $http.get('/NewTravel.json').
    then(function(response) {
      $scope.travelData = response.data.cignatravel;
      
    }, function(response) {
      
    });

    $scope.destinations = [];
    $scope.travel = [];

    $scope.range = function(min, max, step){
      step = step || 1;
      var input = [];
      for (var i = min; i <= max; i += step) input.push(i);
      return input;
    };

    $scope.addDestinations = function() {
      if($scope.travel.destination){
        if($scope.destinations.length < 10){
          $scope.destinations.push($scope.travel.destination);
          $scope.travelData.destination = $filter('filter')($scope.travelData.destination, {country: "!"+$scope.travel.destination.country}, true);
          $scope.travel.destination = "";
        }
       console.log($scope.destinations.length);
      }
    }

    $scope.removeDestination = function(index) {
      console.log($scope.destinations[index]);
      $scope.travelData.destination.push($scope.destinations[index]);
      $scope.destinations = $filter('filter')($scope.destinations, {country: "!"+$scope.destinations[index].country}, true);
    }

    //datepicker

    $scope.travel.date = {startDate: null, endDate: null};

    $scope.openCalendar = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    }

    $scope.addDays = function(date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    $scope.resetEndDate = function() {
      $scope.travel.endDate = null;
      $scope.travel.days = "";
      $scope.maxDate = $scope.addDays($scope.travel.startDate,$scope.travelData.maxdays);
      $scope.minDate = $scope.addDays($scope.travel.startDate,1);
    }

    $scope.calcTravelDays = function() {
      var oneDay = 24*60*60*1000;
      if ($scope.travel.startDate) {
        $scope.travel.days = "รวม "+(Math.floor(( Date.parse($scope.travel.endDate) - Date.parse($scope.travel.startDate) ) / oneDay))+" วัน";
      };
    }
   
    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.today = new Date();

    $scope.minDate = $scope.addDays($scope.today,1);

    $scope.formats = ['dd MMMM yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    //datepicker

    $scope.background = parallaxHelper.createAnimator(-0.05);
  }


})();