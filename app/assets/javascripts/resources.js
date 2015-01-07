app.factory('Programme', ['$resource',
    function($resource){
        return $resource('programmes/:id.json', {id : "@id"}, {
            query: { method:'GET', url:'programmes.json', isArray:true },
            new:   { method:'POST', responseType: 'json'},
            update:{ method:'PATCH', responseType: 'json'}
        });
}]);

app.factory('User', ['$resource',
    function($resource){
        return $resource('users/:id.json', {id : "@id"}, {
            query: { method:'GET', url:'users.json', isArray:true },
            approve: { method:'PATCH', url:'users/:id/approve.json'},
            reject: { method:'PATCH', url:'users/:id/reject.json'},
            getCurrent : { method:'GET', url:'users/info.json'},
        });
}]);

app.factory('Visualisation', ['$resource',
    function($resource){
        return $resource('visualisations/:id.json', {id : "@id"}, {
            query: { method:'GET', url:'visualisations.json', isArray:true },
            approve: { method:'PATCH', url:'visualisations/:id/approve.json'},
            reject: { method:'DELETE', url:'visualisations/:id/reject.json'},
            vote:   { method:'GET', url:'visualisations/:id/vote.json' },
        });
}]);

app.factory('Comment', ['$resource',
    function($resource){
        return $resource('comments/:visid.json', {id : "@id"}, {
            new:    { method: 'POST', url: 'comments.json', responseType: 'json'},
            query:  { method:'GET', url:'comments.json', isArray:true },
            remove: { method: 'DELETE', responseType: 'json'},
        });
}]);

app.factory('Timeslot', ['$resource',
    function($resource){
        return $resource('timeslots/:id.json', {id:"@id"}, {
            query: { method:'GET', url: 'timeslots.json', isArray:true,
                     transformResponse: function(data, header) {
                         var transformed = [];
                         var objs = angular.fromJson(data);
                         
                         for (var i = 0; i < objs.length; i++) {
                            transformed.push(transformTimeslotResponse(objs[i])); 
                         }
                         return transformed;
                     }},            
            get: { transformResponse: function(data, header) {
                         return transformTimeslotResponse(angular.fromJson(data));
                 }},
            new:   { method:'POST', url: 'timeslots.json', responseType: 'json'},
            remove:{ method:'DELETE', responseType: 'json'},
            update:{ method:'PATCH', responseType: 'json'},
        });
}]);

function transformTimeslotResponse(obj) {
     var transformed = {id:obj.id};
     transformed.start = moment(obj.start_time);
     transformed.end = moment(obj.end_time);
     return transformed;  
}
