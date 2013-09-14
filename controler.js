
var myApp = angular.module('myApp', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/rh', {templateUrl: 'v_rh.html',   controller: 'RH'}).
      when('/rh/:id', {templateUrl: 'v_rh.html',   controller: 'RH'}).      
      when('/crm',{templateUrl: 'v_crm.html', controller: 'CRM'}).
      when('/cre_need',{templateUrl: 'v_create_need.html', controller: 'CRE_NEED'}).      
      when('/auth',{templateUrl: 'v_auth.html', controller: 'AUTH'}).
      otherwise({templateUrl: 'v_auth.html', controller: 'AUTH'});
}]);


myApp.controller('CRM',
function ($scope, $http, $routeParams) {
  
if (localStorage['auth'] == 'crm_ok')  
    {
//      $http.get('crm.json').success(function(data) {
      $http.get('http://alticrm-cvernet.rhcloud.com/ws').success(function(data) {
      	$scope.needs = data;
      });    
      $scope.needs = [];
    }
else
     {
       window.location.href ='http://alticrm-cvernet.rhcloud.com/Main.html';
     }  
  });

myApp.controller('RH',
function ($scope, $http, $routeParams) {

if (localStorage['auth'] == 'crm_ok')  
    {
    $http.get('RH.json').success(function(data) {
    	$scope.persons = data;
    });    
     }
     else
     {
       window.location.href ='http://alticrm-cvernet.rhcloud.com/Main.html';
     }
     
    $scope.persons = [];

    $scope.isSearch = function(person){
  if (person.FIELD1.match($routeParams.id)) 
  {return person};
  };
  
  });

myApp.controller('AUTH',
function ($scope, $http, $routeParams) {
  
$scope.check = function () {  
  if ($scope.user == 'crm' && $scope.password == 'crm')
     {
     localStorage['auth'] = 'crm_ok';
     window.location.href ='./Main.html#/crm';
     }
  else
  $scope.message = 'Vous n\'avez pas les autorisations.';
}  
   
  });

myApp.controller('CRE_NEED',
function ($scope, $http, $routeParams) {
  
$scope.save = function () {  
//      $http.get('http://alticrm-cvernet.rhcloud.com/insert/'+$scope.id).success(function(data) {
$scope.id = 123;
      });    
}  
   
  });

