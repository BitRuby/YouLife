app.factory("AuthInterceptor", function(){
    return{
        request: function(config){
            config.headers = config.headers || {};
            var encodedString = btoa("bill:abc123");
            config.headers.Authorization = 'Basic '+encodedString;
            return config;
        }
    };
});

app.config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptor');
}]);

app.factory('UserService', function($http, $q){

    var REST_SERVICE_URI = '';

    var factory = {
        fetchAllUsers: fetchAllUsers
    };
    return factory;
    function fetchAllUsers(){
        var deferredObject = $q.defer();
        $http.get(REST_SERVICE_URI).then(
            function(response){
                deferredObject.resolve(response.data);
            },
            function(errResponse){
                console.error('Error while fetching users');
                defferedObject.reject(errResponse);
            }
        );
        return defferedObject.promise;
    }
});

app.controller('UserController', function($scope, UserService){
    var self = this;

    self.submit = function(){
        UserService.fetchAllUsers().then(
            function(d){
                
            },
            function(errResponse){
                console.error('Error while fetching users');
            }
        );
    }

});


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