(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){module.exports=require("./lib/interface/mocha")},{"./lib/interface/mocha":3}],2:[function(require,module,exports){var lazyVar=require("./lazy_var");var Symbol=require("./symbol");var currentlyRetrievedVarField=Symbol.for("__definesVariable");var parentDefinitionsField=Symbol.for("__parentContextForLazyVars");var isExecutedField=Symbol.for("__isExecuted");function cleanUp(){lazyVar.cleanUp(this)}function registerParentContextFor(varName,suite){if(!suite.ctx.hasOwnProperty(parentDefinitionsField)){suite.ctx[parentDefinitionsField]={}}suite.ctx[parentDefinitionsField][varName]=suite.parent.ctx}function getParentContextFor(varName,testContext){if(!testContext[parentDefinitionsField]){throw new Error('Unknown parent variable "'+varName+'".')}return testContext[parentDefinitionsField][varName]}module.exports=function(context,state,options){context.subject=function(definition){return arguments.length===1?context.def("subject",definition):context.get("subject")};context.get=function(varName){var originalSuite=state.currentTestContext;if(varName===state.currentTestContext[currentlyRetrievedVarField]){state.currentTestContext=getParentContextFor(varName,originalSuite)}try{state.currentTestContext[currentlyRetrievedVarField]=varName;return state.currentTestContext[varName]}finally{delete state.currentTestContext[currentlyRetrievedVarField];state.currentTestContext=originalSuite}};context.def=function(varName,definition){var suite=state.currentlyDefinedSuite;if(suite.parent&&lazyVar.isDefined(suite.parent.ctx,varName)){registerParentContextFor(varName,suite)}return lazyVar.register(suite.ctx,varName,definition)};context.get.definitionOf=context.get.variable=function(varName){return context.get.bind(context,varName)};var describe=context.describe;context.describe=function(title,runTests){return describe(title,function(){state.currentlyDefinedSuite=this;context.before(registerSuite);context.beforeEach(registerSuite);context.afterEach(registerSuite);context.after(registerSuite);runTests.apply(this,arguments);context.afterEach(cleanUp);context.after(cleanUp);state.currentlyDefinedSuite=null})};function registerSuite(){state.currentTestContext=this}}},{"./lazy_var":4,"./symbol":5}],3:[function(require,module,exports){(function(global){var Mocha=typeof window!=="undefined"?window["Mocha"]:typeof global!=="undefined"?global["Mocha"]:null;var injectLazyVarInterface=require("../interface");module.exports=Mocha.interfaces["bdd-lazy-var"]=function(rootSuite){Mocha.interfaces.bdd(rootSuite);var state={currentlyDefinedSuite:rootSuite};rootSuite.on("pre-require",function(context){injectLazyVarInterface(context,state);context.context=context.describe;context.context.skip=context.describe.skip=describe.skip;context.context.only=context.describe.only=describe.only})}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"../interface":2}],4:[function(require,module,exports){var prop=require("./symbol").for;var lazyVarsPropName=prop("_lazyVars");var lazyVar={register:function(context,name,definition){var hasOwnVariable=context.hasOwnProperty(name)&&context.hasOwnProperty(lazyVarsPropName);if(hasOwnVariable&&lazyVar.isDefined(context,name)){throw new Error('Cannot define "'+name+'" variable twice in the same suite.')}if(!context.hasOwnProperty(lazyVarsPropName)){context[lazyVarsPropName]={defined:{},created:{}}}var metatadata=context[lazyVarsPropName];metatadata.defined[name]=true;Object.defineProperty(context,name,{get:function(){if(!metatadata.created.hasOwnProperty(name)){metatadata.created[name]=typeof definition==="function"?definition():definition}return metatadata.created[name]}})},isDefined:function(context,name){var hasLazyVars=context&&context[lazyVarsPropName];return hasLazyVars&&context[lazyVarsPropName].defined[name]},cleanUp:function(context){if(context.hasOwnProperty(lazyVarsPropName)){context[lazyVarsPropName].created={}}}};module.exports=lazyVar},{"./symbol":5}],5:[function(require,module,exports){var indentity=function(value){return value};module.exports={"for":typeof Symbol==="undefined"?indentity:Symbol.for}},{}]},{},[1]);