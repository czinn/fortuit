angular.module('FortuitApp', [])
  .controller('MainCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.probabilities = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    $scope.confidences = [50, 60, 70, 80, 90, 99];
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

    $scope.submit = function(confidence) {
      $http.post('/api/predictions/', {desc: $scope.new_prediction_desc, confidence: confidence/100}).
        success(function(prediction) {
          prediction.percent = Math.round(prediction.confidence * 100);
          $scope.predictions.unshift(prediction);
        });
    };

    $scope.setView('home');
  }]);
