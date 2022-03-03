const request = require ( 'request' );
const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
var expect = chai.expect;

var AuthBoundary = require ( '../index.js' );


describe ( 'auth-boundary', function () {
    var app_mock = undefined;
    var done_mock = undefined;
    var auth_ds = undefined;
    var session_ds = undefined;
    var next_fake = undefined;
    
    beforeEach ( function () {
        done_fake = sinon.fake.returns ();
        auth_ds = { 'password': 'random-password' };
        session_ds = { 'interface': 'random-interface' };
        next_fake = sinon.fake.returns ();
        
        app_mock = {
            config: {
                boundary_url: 'random-boundary-url',
                target_id: 'random-target-id',
                interfaces: [ 'random-interface' ]
            },
            addHook: function ( type, cb ) {
                cb ( auth_ds, session_ds, next_fake );
            }
        };
    } );
    
    
    it ( 'Correct auth', function () {
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, { statusCode: 200 } );
        
        AuthBoundary.init ( app_mock, done_fake );
        
        var post_args = post_stub.getCalls () [ 0 ].args [ 0 ];
        expect ( post_args [ 'url' ] ).to.equal ( 'random-boundary-url/v1/targets/random-target-id:authorize-session' );
        expect ( post_args [ 'method' ] ).to.equal ( 'post' );
        expect ( post_args [ 'json' ] ).to.be.true;
        expect ( post_args [ 'headers' ] [ 'Content-Type' ] ).to.equal ( 'application/json' );
        expect ( post_args [ 'headers' ] [ 'Authorization' ] ).to.equal ( 'Bearer random-password' );
        expect ( post_args [ 'form' ] ).to.eql ( {} );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        expect ( next_fake.getCalls () [ 0 ].args ).to.eql ( [] );
        
        post_stub.restore ();
    } );
    
    
    it ( 'Request : response code <> 200', function () {
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, { statusCode: 0 } );
        
        AuthBoundary.init ( app_mock, done_fake );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        post_stub.restore ();
    } );
    
    
    it ( 'Request : error exists', function () {
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( 'random-error', null );
        
        AuthBoundary.init ( app_mock, done_fake );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        post_stub.restore ();
    } );
    
    
    it ( 'Interface not valid', function () {
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, { statusCode: 200 } );
        
        session_ds = { 'interface': 'another-interface' };
        
        AuthBoundary.init ( app_mock, done_fake );
        
        var post_args = post_stub.getCalls () [ 0 ].args [ 0 ];
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 2 );
        expect ( next_fake.getCalls () [ 0 ].args ).to.eql ( [] );
        
        post_stub.restore ();
    } );
} );
