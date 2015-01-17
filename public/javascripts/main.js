angular.module('FortuitApp', [])
  .controller('MainCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.probabilities = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    $scope.confidences = [50, 60, 70, 80, 90, 99];
    $scope.predictions = [];
    $scope.page = 0;

    $scope.setView = function(view) {
      // Do onload stuff
      if(view === 'home') {
        $http.get('/api/users/me/predictions?resolved=false')
          .success(function(data) {
            if(data.error) {
              $scope.predictions = [];
            } else {
              $scope.predictions = data; 
              $scope.predictions.forEach(function(prediction) {
                prediction.percent = Math.round(prediction.confidence * 100);
              });
            }

            $scope.view = 'home';
          })
          .error(function(data) {
            console.log('Failed at getting data');
            $scope.view = 'home';
          });
      } else if(view === 'archive') {
        $scope.page = 0;
        $http.get('/api/users/me/predictions?resolved=true')
          .success(function(data) {
            if(data.error) {
              $scope.predictions = [];
            } else {
              $scope.predictions = data; 
              $scope.predictions.forEach(function(prediction) {
                prediction.percent = Math.round(prediction.confidence * 100);
              });
            }
            $scope.view = 'archive';
          })
          .error(function(data) {
            console.log('Failed at getting data');
            $scope.view = 'archive';
          });
      } else {
        $scope.view = view;
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
