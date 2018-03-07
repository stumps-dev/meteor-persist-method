Package.describe({
  name: 'stumps:persist-method',
  version: '1.0.0',
  summary: 'Persist a Meteor method call in the browser storage until it actually ran on the server.',
  git: 'https://github.com/stumpss/meteor-persist-method',
  documentation: 'README.md'
})

Package.onUse(function (api) {

  api.use([
    'ecmascript@0.1.3',
    'random@1.1.0'
  ])

  api.addFiles(['persist-method.js'], 'client')

  Npm.depends({
    'localforage': '1.5.6',
    'localforage-getitems': '1.4.1',
  })
})
