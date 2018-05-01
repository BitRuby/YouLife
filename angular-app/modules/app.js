var app = angular.module('App', ['ngRoute']);
app.controller("DefaultController",
    function(){
    }
);

app.factory("Authorize", function(){
    var user;
    var id;
    var cond;
    return {
        setUser: function(id){
            this.id = id;
        },
        currentUser: function(){
            return this.id;
        },
        setLoggedOutInfo: function(cond){
            this.cond = cond;
        },
        getLoggedOutInfo: function(){
            return this.cond;
        }
    };

});

app.controller("LoginController",
    function($http, $location, $rootScope, Authorize, $scope){
        var self = this;        
        self.submit = function(){
            $http.get('http://127.0.0.1:5500/angular-app/json/users.json')
            .then(function(response){
                var records = response.data.records;
                for (var i=0; i < records.length; i++){
                    if ( records[i].username == self.username &&
                        records[i].password == self.password ){
                            Authorize.setUser(records[i].id);
                            $rootScope.loggedIn = true;
                            $location.path('/dashboard');
                        }
                }
                if ( Authorize.currentUser() == null ){
                    if (!self.password != "" || !self.username != "") { self.message = "Fields can't be empty!";}
                    else{ self.message = "Invalid credentials provided"; }
                }
            });
        }
        self.enter = function(){
            if (event.which == 13){
                self.submit();
            }
        }
        $scope.$watch(Authorize.getLoggedOutInfo, function(){
            if (Authorize.getLoggedOutInfo())
                {
                    self.showTouchID=true;
                }
        });
    }
);

app.controller("DashboardController",
    function($location, $rootScope, Authorize){
        var self = this;
        self.submit = function(){
            Authorize.setUser(null);
            Authorize.setLoggedOutInfo(true);
            $rootScope.loggedIn = false;
            $location.path('/login');
        }
    }
);

app.config(['$routeProvider', 
    function($routeProvider){
        $routeProvider
        .when('/login', {
            resolve: {
                "check": function($location, $rootScope){
                    if($rootScope.loggedIn){
                        $location.path('/dashboard');
                    }
                }
            },
            templateUrl: 'modules/login.html'
        })
        .when('/dashboard', {
            resolve: {
                "check": function($location, $rootScope){
                    if(!$rootScope.loggedIn){
                        $location.path('/login');
                    }
                }
            },
            templateUrl: 'modules/dashboard.html'
        })
        .when('/', {
            templateUrl: 'modules/main.html'
        })
        .otherwise({
            redirectTo: '/'
        });
    }
]);