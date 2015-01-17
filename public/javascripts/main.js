angular.module('FortuitApp', [])
  .controller('MainCtrl', ['$scope', function($scope) {
    $scope.view = 'home';

    $scope.setView = function(view) {
      $scope.view = view;
    };

    $scope.logout = function() {
      window.location = "/logout";
    }
  }]);
