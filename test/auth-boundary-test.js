const request = require ( 'request' );
const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
var expect = chai.expect;

var AuthBoundary = require ( '../index.js' );



describe ( 'auth-boundary', function () {
    var app_mock;
    var done_mock;
    var auth_mock;
    var session_mock;
    var next_mock;
    
    beforeEach ( function () {
        done_mock = function () { return; };
        auth_mock = { 'password': 'random-password' };
        session_mock = { 'interface': 'random-inteface' };
        next_mock = function () { return; };
        
        app_mock = {
            config: {
                boundary_url: 'random-boundary-url',
                target_id: 'random-target-id',
                interfaces: [ 'random-interface' ]
            },
            addHook: function ( type, cb ) {
                cb ( auth_mock, session_mock, next_mock );
            }
        };
    } );
    
    
    it ( 'Correct auth', function () {
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, { statusCode: 200 }, JSON.stringify ( { login: "bulkan" } ) );
        
        AuthBoundary.init ( app_mock, done_mock );
        
        var post_args = post_stub.getCalls () [ 0 ].args [ 0 ];
        expect ( post_args [ 'url' ] ).to.equal ( 'random-boundary-url/v1/targets/random-target-id:authorize-session' );
        expect ( post_args [ 'method' ] ).to.equal ( 'post' );
        expect ( post_args [ 'json' ] ).to.be.true;
        expect ( post_args [ 'headers' ] [ 'Content-Type' ] ).to.equal ( 'application/json' );
        expect ( post_args [ 'headers' ] [ 'Authorization' ] ).to.equal ( 'Bearer random-password' );
        expect ( post_args [ 'form' ] ).to.eql ( {} );
        
        post_stub.restore ();
    } );

} );
