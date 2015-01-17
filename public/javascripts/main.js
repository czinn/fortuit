angular.module('FortuitApp', [])
  .controller('MainCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.predictions = [];

    $scope.setView = function(view) { 
      $scope.view = view;

      // Do onload stuff
      if(view === 'home') {
        $http.get('/api/users/me/predictions')
          .success(function(data) {
            if(data.error) {
              $scope.predictions = [];
            } else {
              $scope.predictions = data;
              $scope.predictions.forEach(function(prediction) {
                prediction.percent = Math.round(prediction.confidence * 100);
              });
            }
          })
          .error(function(data) {
            console.log('Failed at getting data');
          });
      }
    };

    $scope.logout = function() {
      window.location = '/logout';
    }

    $scope.setView('home');
  }]);