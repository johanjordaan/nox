nox ![Travis CI Status](https://api.travis-ci.org/johanjordaan/nox.svg?branch=master "Travis CI Status")
===

A framework for generating parameter based random data structures

Installing and Testing
=======================
`npm install`
`npm test`


Simple Example
==============

Let say you are writing a game and have some zombies that randomly appears. An instance of a zombie looks something like this:

```javascript
var zombie = {
	hp: 20,
	xp: 50,
}
```
This is one instance of a zombie. The template for a zombie looks something like this:
```javascript
var zombieTemplate = {
	hp: <some value between 10 and 20>,
	xp: <the hp*1.5>,
}
```
This is where nox comes in. It provides a way to define these types of templates. Here is an example of the above template using nox:
```javascript
var zombieSpec = {
	hp: nox.rnd({min:10,max:20}),
	xp: nox.method((o)=>{o.xp = o.hp*1.5;})
}
```

Now we can construct any number of zombies using this template like this:
```javascript
var zombieTemplate = nox.createTemplate('Zombie',zombieSpec);
var zombie1 = nox.constructTemplate('Zombie');
var zombie2 = nox.constructTemplate('Zombie');
```

Now you have two zombies that conform to the structure *and* value parameters.  





Don't look here :)
==================
Notes:

a *noxTemplate* consists of a mix of
*noxTypes* and java types
and can be instantiated as a *noxObject*

3x5rz8 <-- Not a password :)
