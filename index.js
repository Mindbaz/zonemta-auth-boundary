'use strict';

/*
  SMTP authentication with Boundary (Hashicorp)
  Validates tokens via API calls
  Tokens must be passed as "password" during authenticating
*/

const request = require ( 'request' );

module.exports.title = 'Hashicorp Boundary Authentication';
module.exports.init = (app, done) => {
    // Listen for AUTH command
    
    /**
     * Authentication Boundary URL
     * @type {string}
     */
    const auth_url = `${app.config.boundary_url}/v1/targets/${app.config.target_id}:authorize-session`;
    
    app.addHook ( 'smtp:auth', ( auth, session, next ) => {
        if ( ! app.config.interfaces.includes ( session.interface ) ) {
            // Not an interface we care about
            next ();
        }
        
        request.post (
            {
                url: auth_url,
                method: 'post',
                json: true,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.password}`
                },
                form: {}
            },
            ( err, res ) => {
                if ( err || res.statusCode !== 200 ) {
                    // Authentication : failed
                    let err = new Error ( 'Authentication failed' );
                    err.responseCode = 535;
                    return next ( err );
                }
                
                // Authentication : success
                next ();
            }
        );
    } );
    
    done ();
};
