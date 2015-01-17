angular.module('FortuitApp', [])
  .controller('MainCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.probabilities = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    $scope.confidences = [50, 60, 70, 80, 90, 99];
    $scope.predictions = [];
    $scope.page = 0;
    $scope.pageCount = 1;

    function getPredictions(options, cb) {
      var queryString = "/api/users/me/predictions";
      if(options.count)
        queryString += "/pages";
      if(options.resolved !== undefined)
        queryString += "?resolved=" + options.resolved;
      if(options.page !== undefined)
        queryString += "&page=" + options.page;
      $http.get(queryString)
        .success(function(data) {
          if(!data.error) {
            cb(data);
          }
        })
        .error(function(data) {
          console.log('Failed at getting data');
          
          cb(null);
        });
    }

    $scope.setView = function(view) {
      // Do onload stuff
      if(view === 'home') {
        $scope.predictions = [];
        getPredictions({resolved: false}, function(data) {
          if(data !== null) {
            $scope.predictions = data;
            $scope.predictions.forEach(function(prediction) {
              prediction.percent = Math.round(prediction.confidence * 100);
            });
          }
          $scope.view = 'home';
        });
      } else if(view === 'archive') {
        $scope.page = 0;
        $scope.predictions = [];

        getPredictions({count: true, resolved: true}, function(pageCount) {
          if(pageCount !== null) {
            $scope.pageCount = pageCount;
            getPredictions({resolved: true, page: 0}, function(data) {
              if(data !== null) {
                $scope.predictions = data; 
                $scope.predictions.forEach(function(prediction) {
                  prediction.percent = Math.round(prediction.confidence * 100);
                });
              }
              $scope.view = 'archive';
            });
          } else {
            $scope.view = 'archive';
          }
        });
      } else {
        $scope.view = view;
      }
    };

    $scope.changePage = function(delta) {
      if($scope.view === 'archive') {
        if($scope.page + delta >= 0 && $scope.page + delta < $scope.pageCount) {
          $scope.page = delta;
          getPredictions({resolved: true, page: $scope.page}, function(data) {
            if(data !== null) {
              $scope.predictions = data;
              $scope.predictions.forEach(function(prediction) {
                prediction.percent = Math.round(prediction.confidence * 100);
              });
            }
          });
        }
      }
    };

    $scope.logout = function() {
      window.location = '/logout';
    };

    $scope.submitPrediction = function(confidence) {
      $http.post('/api/predictions/', {desc: $scope.new_prediction_desc, confidence: confidence/100}).
        success(function(prediction) {
          prediction.percent = Math.round(prediction.confidence * 100);
          $scope.predictions.unshift(prediction);
        });
    };

    $scope.setView('home');
  }]);
