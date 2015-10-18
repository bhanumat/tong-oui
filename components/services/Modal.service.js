;(function() {
 angular
      .module('cignaApp')
      .service('ModalService', [
        '$modal','$sce', ModalService
      ]);


function ModalService($modal,$sce) {

    var modalDefaults = {
            backdrop : true,
            keyboard : true,
            modalFade : true,
            templateUrl : 'components/services/modal.tpl.html'
    };

    var modalOptions = {
            btnClose : 'btnClose',
            btnPrimary : 'btnPrimary',
            title : 'title',
            message : 'message'
    };

    this.showInfo = function(customModalOptions, customModalDefaults) {
        var modalDefaults = {
            backdrop : 'static'
        };
        var modalOptionsDefaults = {
                btnClose : 'Close',
                btnPrimary : null,
                title : 'Information',
                class : 'info',
                message : 'Information'
        };

        angular.extend(modalDefaults, customModalDefaults);
        angular.extend(modalOptionsDefaults, customModalOptions);

        return this.show(modalDefaults, modalOptionsDefaults);
    };

    this.showWarning = function(customModalOptions, customModalDefaults) {
        var modalDefaults = {
            backdrop : 'static'
        };
        var modalOptionsDefaults = {
                btnClose : 'OK',
                btnPrimary : null,
                title : 'Warning',
                class : 'warning',
                message : 'Warning'
        };

        angular.extend(modalDefaults, customModalDefaults);
        angular.extend(modalOptionsDefaults, customModalOptions);

        return this.show(modalDefaults, modalOptionsDefaults);
    };

    this.showError = function(customModalOptions, customModalDefaults) {
        var modalDefaults = {
            backdrop : 'static'
        };
        var modalOptionsDefaults = {
                btnClose : 'Close',
                btnPrimary : undefined,
                title : 'Error',
                class : 'error',
                message : 'Error'
        };

        angular.extend(modalDefaults, customModalDefaults);
        angular.extend(modalOptionsDefaults, customModalOptions);

        return this.show(modalDefaults, modalOptionsDefaults);
    };

    this.showConfirm = function(customModalOptions, customModalDefaults) {
        var modalDefaults = {
            backdrop : 'static'
        };
        // Note in boolean expression of javascript 'Yes' is true, 'No' is false
        // So, to avoid this, just append white-space
        var modalOptionsDefaults = {
                btnClose : 'No ',
                btnPrimary : 'Yes ',
                title : 'Confirmation',
                class : 'confirm',
                message : 'Confirmation'
        };

        angular.extend(modalDefaults, customModalDefaults);
        angular.extend(modalOptionsDefaults, customModalOptions);
        return this.show(modalDefaults, modalOptionsDefaults);
    };

    this.show = function(customModalDefaults, customModalOptions) {
        // Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        if(!customModalDefaults) {
            customModalDefaults = modalDefaults;
        }
        if(!customModalOptions) {
            customModalOptions = modalOptionsDefaults;
        }

        // Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        // Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function($scope, $modalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function(result) {
                    $modalInstance.close(result);
                };
                $scope.modalOptions.close = function() {
                    $modalInstance.dismiss('cancel');
                };
                $scope.trustAsHtml = function(string) {
                  return $sce.trustAsHtml(string);
                };
            };
        }

        var promise =  $modal.open(tempModalDefaults);
        return promise.result;
    };

}

})();