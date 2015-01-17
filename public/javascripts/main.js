angular.module('FortuitApp', [])
  .controller('MainCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.probabilities = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99];
    $scope.confidences = [50, 60, 70, 80, 90, 99];
    $scope.predictions = [];
    $scope.page = 0;
    $scope.pageCount = 1;
    $scope.user = user;

    var lineChart = null;

    function getPredictions(options, cb) {
      var queryString = "/api/users/"
      if(options.userId)
        queryString += options.userId;
      else
        queryString += "me"
      queryString += "/predictions";
      if(options.count)
        queryString += "/pages";
      if(options.resolved !== undefined)
        queryString += "?resolved=" + options.resolved;
      if(options.page !== undefined)
        queryString += "&page=" + options.page;
      $http.get(queryString)
        .success(function(data) {
          if(!data.error) {
            for (var i=0; i<data.length; i++) {
              var date = new Date(data[i].created);
              months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
              data[i].niceDate = months[date.getMonth()] + " " + date.getDay() + " " + date.getFullYear() + ", " + date.toLocaleTimeString();
            }
            cb(data);
          }
        })
        .error(function(data) {
          console.log('Failed at getting data');

          cb(null);
        });
    }

    function renderGraph(data) {
      if(lineChart !== null) {
        lineChart.destroy();
      }

      $scope.statScore = data.score;

      var ctx = document.getElementById("statGraph").getContext("2d");
      var targetWidth = Math.min(800, window.innerWidth - 20);
      ctx.canvas.height *= Math.round(targetWidth / ctx.canvas.width);
      ctx.canvas.width = targetWidth - 20;

      var chart = new Chart(ctx);
      var chartData = {
        labels: [],
        datasets: [{
          label: "probabilities",
          fillColor: "rgba(151,187,205,0.2)",
          strokeColor: "rgba(151,187,205,1)",
          pointColor: "rgba(151,187,205,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(151,187,205,1)",
          data: []
        },
        {
          label: "target",
          fillColor: "rgba(255,255,0,0.2)",
          strokeColor: "rgba(255,255,0,1)",
          pointColor: "rgba(255,255,0,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(151,187,205,1)",
          data: []
        }]
      };
      var options = {
        pointDot: false,
        datasetFill: false,
        showTooltips: false
      };
      for(var i = 0; i < data.barGraph.bars.length; i++) {
        if(i === 0)
          chartData.labels.push("1");
        else if(i === data.barGraph.bars.length - 1)
          chartData.labels.push("99")
        else
          chartData.labels.push(data.barGraph.bars[i].x + "");
        chartData.datasets[0].data.push(data.barGraph.bars[i].y);
        chartData.datasets[1].data.push(data.barGraph.bars[i].x);
      }
      lineChart = chart.Line(chartData, options);
    }

    $scope.setView = function(view) {
      // Do onload stuff
      if(view === 'home') {
        $scope.new_prediction_confidence = 50;
        $scope.predictions = [];
        getPredictions({resolved: false}, function(data) {
          if(data !== null) {
            $scope.predictions = data;
          }
          $scope.view = 'home';
        });
      } else if(view === 'archive') {
        $scope.page = 0;
        $scope.predictions = [];

        getPredictions({count: true, resolved: true}, function(pageCount) {
          if(pageCount !== null) {
            $scope.pageCount = pageCount.count;
            getPredictions({resolved: true, page: 0}, function(data) {
              if(data !== null) {
                $scope.predictions = data;
              }
              $scope.view = 'archive';
            });
          } else {
            $scope.view = 'archive';
          }
        });
      } else if(view === 'friends') {
        $scope.friends = [];
        $http.get("/api/users/me/friends")
          .success(function(data) {
            if(data !== null) {
              $scope.friends = data['friends'];
            }
            $scope.view = 'friends';
          });
      } else if(view.indexOf('friends/') == 0) {
        var friendId = view.slice(8);
        $http.get("/api/users/" + friendId)
          .success(function(friend) {
            $scope.friend = friend;
            getPredictions({count: true, userId: $scope.friend._id, resolved: true}, function(pageCount) {
              if(pageCount !== null) {
                $scope.pageCount = pageCount.count;
                getPredictions({resolved: true, userId: $scope.friend._id, page: 0}, function(data) {
                  if(data !== null) {
                    $scope.predictions = data;
                  }
                  $scope.view = view;
                });
              }
            })
          });
      } else if(view === 'stats') {
        $http.get('/api/users/me/stats')
          .success(function(data) {
            renderGraph(data);
            $scope.view = 'stats';
          })
          .error(function(data) {
            $scope.view = 'stats';
          });
      } else {
        $scope.view = view;
      }
    };

    $scope.changePage = function(delta) {
      if($scope.view === 'archive') {
        if($scope.page + delta >= 0 && $scope.page + delta < $scope.pageCount) {
          $scope.page += delta;
          var opts = {resolved: true, page: $scope.page};
          getPredictions(opts, function(data) {
            if(data !== null) {
              $scope.predictions = data;
            }
          });
        }
      }
      else if($scope.view.indexOf('friends/') == 0) {
        if($scope.page + delta >= 0 && $scope.page + delta < $scope.pageCount) {
          $scope.page += delta;
          var opts = {resolved: true, userId: $scope.friend._id, page: $scope.page};
          getPredictions(opts, function(data) {
            if(data !== null) {
              $scope.predictions = data;
            }
          });
        }
      }
    };

    $scope.logout = function() {
      window.location = '/logout';
    };

    $scope.submitPrediction = function() {
      $http.post('/api/predictions/', {desc: $scope.new_prediction_desc, confidence: $scope.new_prediction_confidence})
        .success(function(prediction) {
          $scope.predictions.unshift(prediction);
          $scope.new_prediction_desc = "";
          $scope.new_prediction_confidence = 50;
        });
    };

    $scope.resolvePrediction = function(prediction, result) {
      $http.post('/api/affairs/' + prediction.affair._id, {result: result})
        .success(function(affair) {
          // Don't really care about the affair
          for(var i = 0; i < $scope.predictions.length; i++) {
            if($scope.predictions[i]._id === prediction._id) {
              $scope.predictions.splice(i, 1);
              break;
            }
          }
          console.log(affair);
        });
    };

    $scope.deletePrediction = function(prediction, result) {
      $http.delete('/api/predictions/' + prediction._id, {result: result})
        .success(function(affair) {
          for(var i = 0; i < $scope.predictions.length; i++) {
            if($scope.predictions[i]._id === prediction._id) {
              $scope.predictions.splice(i, 1);
              break;
            }
          }
        });
    };

    $scope.addFriend = function() {
      $http.post('/api/users/me/add-friend', {newFriendName: $scope.newFriendName})
        .success(function(newFriend) {
          $scope.friends.push(newFriend);
        });
    };

    $scope.setView('home');
  }]);
