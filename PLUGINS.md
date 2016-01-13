# Plugin architecture documentation

This documentation is not even beta (lulz) and does not come with warranty of any
kind.  Also, these are not your regular third party implementable plugins.  They
are simply provided to allow develoment of modules without changing the base
code for EpochTalk.

## In-house only

The "Plugin" system currently implemented is completely unsecured.  This is not
a publicly developable plugin system, and you should not trust any unofficial
plugins because they give full read/write access to everything.

## When are plugins installed in the build process?

Plugins are automatically installed when running scripts/[build, prod-build,
serve]

At that time, the plugin system will search through the `node_modules` directory

## Where are plugins defined?

Plugin names are defined in plugin-conf.js

If a plugin is already installed, the _system_ is smart enough to recognize this
and not install it again.

## How do I run plugins?

Call plugins.fire(endpointKey, value) when you want the plugins to fire with
that particular endpointKey (currently [before-post, after-post])
This will fire all plugins that were loaded into the endpointCache

## Current plugin installation scheme

Add the name of the plugin to the plugin array in plugin-conf.

The plugin will be installed by name with an npm install command.

On success, the install script will migrate whatever tables are in the plugin
package's `/migrations/up.sql`.  Currently, this migration can do basically
anything possible through a full access db-migrate command and should be
formatted in db-migrate form.

The plugin will then be listed in the plugin database.

## What exactly can a plugin do?

All plugins should function as a node module (ie. be able to require())

Current bootstrap options for a plugin are...

```
{
  db: <database_methods>,
  endpoints: <endpoints>,
  routes: <routes>,
  templateHooks: <hooks>
}
```

db contains methods to be tacked onto whatever core is being used.  they are
added as dot methods (ex:  `db.whateverMethod()`)

endpoints adds endpoints to endpointCache
  endpoint methods can implement hooks:
  before-post
  after-post

  hooks are called on `plugins.fire` for whichever key was passed as the first
parameter, with whatever value was passed as the second parameter

routes is an array of routes.  it is returned in the final `.then` clause of
`plugins.bootstrap`

templateHooks
  'boards-before': [],
  'boards-after': [],
  'board-actions': [],
  'thread-actions': [],
  'post-profile': [],
  'post-actions': [],
  'post-body-after': [],
  'profile-details': [],
  'profile-display': []
