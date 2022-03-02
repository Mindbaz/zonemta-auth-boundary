'use strict';

/*
  Copyright (C) 2022 Mindbaz
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
  
  --
  
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
            ( error, response ) => {
                if ( error || response.statusCode !== 200 ) {
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
