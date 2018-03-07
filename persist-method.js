import EventEmitter from 'events'
import localforage from 'localforage'
import { extendPrototype } from 'localforage-getitems'; extendPrototype(localforage)
import { Random } from 'meteor/random'

//persister object
Persister = new EventEmitter()

//localforage method store
Persister._methodStore = localforage.createInstance({
  driver: [localforage.WEBSQL, localforage.INDEXEDDB, localforage.LOCALSTORAGE],
  name: 'meteor-persister',
  storeName: 'methods'
})

//wrap Meteor method functions
Persister.call = function (name) {

  const args = Array.prototype.slice.call(arguments, 1)

  if (args.length && typeof args[args.length - 1] === 'function')
    var callback = args.pop()

  return this.apply(name, args, callback)
}

Persister.apply = function (name, args, options, callback) {

  if (!callback && typeof options === 'function') {

    callback = options
    options = {}
  }

  options = options || {}

  //persist method call
  const key = options.id || Random.id()

  const poptions = Object.assign({}, options)
  delete poptions.onResultReceived //we can't store functions in browser storage obviously
  delete poptions.id

  const value = [
    name,
    args,
    poptions
  ]

  if (typeof callback !== 'function')
    callback = () => {}

  this._methodStore.setItem(key, value).catch(callback)

  //remove persisted method when run succesfully on the server
  const obsCallback = (err, res) => {

    const method = {
      name,
      args,
      options
    }

    Persister.emit('methodFinished', method, err, res)

    if (err)
      return callback(err, res)

    this._methodStore.removeItem(key)
      .then(() => callback(err, res))
      .catch(callback)
  }

  //run method
  Persister.emit('method', name, args, options)

  Meteor.apply(name, args, options, obsCallback)
}

//run persisted methods on startup
Meteor.startup(() => {

  Persister._methodStore.getItems()
    .then(methods => {

      const promises = []

      for (key in methods) {

        const mthd = methods[key]
        const name = mthd[0]
        const args = mthd[1]
        const options = mthd[2]

        Persister.emit('method', name, args, options)

        Meteor.apply(name, args, options, (err, res) => {

          const method = {
            name,
            args,
            options
          }

          Persister.emit('methodFinished', method, err, res)

          if (err)
            return false

          Persister._methodStore.removeItem(key)
        })
      }
    })
    .catch(err => { throw new Error(err) })
})
