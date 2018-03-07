# What is this?
This package will enable you to call Meteor methods and store the method call in browser storage to be re-called again on startup until the method actually ran on the server. This could be useful for apps working offline.
## How to use
You basically call your methods exactly the same way like you always do but instead of:
```javascript
Meteor.call(name, arg1, arg2.., callback)
Meteor.apply(name, [args], options, callback)
```
You replace "Meteor" with "Persister" so:
```javascript
Persister.call(name, arg1, arg2.., callback)
Persister.apply(name, [args], options, callback)
```
Now your methods will be stored in browser storage and called again on startup until eventually the server received the method call.
### Overwriting methods stored
If you want to persist 2 of the same methods and have the latter overwrite the first one you can give an id to the methods by passing it in the options argument, e.g.
```javascript
Persister.apply(name, [args], { id: 'myAwsomeMethod' }, callback)
```
