### Server Decorations
 * [db] = {Object} The DB instance along with all it's methods
 * [redis] = {Object} The redis instance
 * [imagesStore] = {Object} The image store API
 * [sanitizer] = {Object} The sanitization API
 * [parser] = {Function} The encoding parsing function
 * [modules] = {Object} API methods from various modules
 * [authorization] = {Object} Authorization API (common, stitch, build)
 * [roles] = {Object} Current snapshot of how the roles look like
 * [roleLayouts] = {Object} Role layout data for all roles
 * [roleValidations] = {Object} Role validation functions for all roles
 * [rolesAPI] = {Object} Role helper functions
 * [session] = {Object} Helper Functions built around user sessions
 * [emailer] = {Object} Init and Send functions for emails


### Request Decorations
 * [db] = {Object} The DB instance along with all it's methods
 * [redis] = {Object} The redis instance
 * [imagesStore] = {Object} The image store API
 * [sanitizer] = {Object} The sanitization API
 * [parser] = {Function} The encoding parsing function
 * [modules] = {Object} API methods from various modules
 * [roles] = {Object} Current snapshot of how the roles look like
 * [roleLayouts] = {Object} Role layout data for all roles
 * [roleValidations] = {Object} Role validation functions for all roles
 * [rolesAPI] = {Object} Role helper functions
 * [session] = {Object} Helper Functions built around user sessions
 * [hooks] = {Object} Pre and Post hooks by route
 * [emailer] = {Object} Init and Send functions for emails


### Server Extensions
 * **onRequest**:
   - Checks if IP is in the blacklist
 * **onPostAuth**:
   - Check if usage limit for this route is above threshold
   - Validate route authorization based on role permissions
 * **onPostHandler**:
   - moderation log


### Server Exposed (Hapi Plugins)
 Access through '(request.)server.plugins.{pluginName}[property]'
 * **blacklist**
   - retrieveBlacklist = {Function} Retrieves blacklist data
 * **limiter**
   - updateLimits = {Function} Updates the default route limits on the fly
 * **acls**
   - getACLValue( [Object] UserAuthObject, [String] aclString )
     - Returns the masked permission value for one permission
   - getUserPriority( [Object] UserAuthObject )
     - Returns the masked priority for a given user auth object
   - getPriorityRestrictions( [Object] UserAuthObject )
     - Returns the masked priority restrictions for a given user auth object
   - verifyRoles()
     - Rebuilds the internal roles object after merging defaults and db results.


### Server methods
 * Authorization
   - authorization methods as defined by modules
 * Common
   - 'common.images.sub': Replaces image links with CDN copy
   - common methods as defined by modules
