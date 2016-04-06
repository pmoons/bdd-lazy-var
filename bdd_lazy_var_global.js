(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){module.exports=require("./lib/interface/mocha/bdd_global_var")},{"./lib/interface/mocha/bdd_global_var":5}],2:[function(require,module,exports){var prop=require("./symbol").for;var lazyVarsPropName=prop("__lazyVars");function defineGetter(context,variable){var vars=context[lazyVarsPropName]=context[lazyVarsPropName]||{};if(variable.name in vars){return}if(variable.name in context){throw new Error(['Cannot create lazy variable "',variable.name,'" as variable with the same name exists on the provided context'].join(""))}vars[variable.name]=true;Object.defineProperty(context,variable.name,{configurable:true,get:variable.get})}defineGetter.for=function(suite,variable,context){defineGetter(context,variable)};module.exports=defineGetter},{"./symbol":7}],3:[function(require,module,exports){var lazyVar=require("./lazy_var");var Symbol=require("./symbol");var noop=function(){};var currentlyRetrievedVarField=Symbol.for("__definesVariable");var parentDefinitionsField=Symbol.for("__parentContextForLazyVars");function cleanUp(){lazyVar.cleanUp(this)}function registerParentContextFor(varName,suite){if(!suite.ctx.hasOwnProperty(parentDefinitionsField)){suite.ctx[parentDefinitionsField]={}}suite.ctx[parentDefinitionsField][varName]=suite.parent.ctx}function getParentContextFor(varName,testContext){if(!testContext[parentDefinitionsField]){throw new Error('Unknown parent variable "'+varName+'".')}return testContext[parentDefinitionsField][varName]}function defaultOptions(options){options.suite=options.suite||"describe";options.setupSuite=options.setupSuite||"before";options.teardownSuite=options.teardownSuite||"after";options.setup=options.setup||"beforeEach";options.teardown=options.teardown||"afterEach";options.onDefine=options.onDefine||noop;return options}module.exports=function(context,state,options){options=defaultOptions(options||{});context.subject=function(name,definition){if(arguments.length===1){return context.def("subject",name)}else if(arguments.length===2){context.def(name,definition);return context.def("subject",context.get.bind(context,name))}return context.get("subject")};context.get=function(varName){var originalSuite=state.currentTestContext;if(varName===state.currentTestContext[currentlyRetrievedVarField]){state.currentTestContext=getParentContextFor(varName,originalSuite)}try{state.currentTestContext[currentlyRetrievedVarField]=varName;return state.currentTestContext[varName]}finally{delete state.currentTestContext[currentlyRetrievedVarField];state.currentTestContext=originalSuite}};context.def=function(varName,definition){var suite=state.currentlyDefinedSuite;if(suite.parent&&lazyVar.isDefined(suite.parent.ctx,varName)){registerParentContextFor(varName,suite)}lazyVar.register(suite.ctx,varName,typeof definition==="function"?wrapDefs(definition):definition);options.onDefine(suite,{name:varName,get:context.get.variable(varName)},context)};context.get.definitionOf=context.get.variable=function(varName){return context.get.bind(context,varName)};var suite=context[options.suite];context[options.suite]=function(title,runTests){return suite(title,function(){var previousDefinedSuite=state.currentlyDefinedSuite;state.currentlyDefinedSuite=this;context[options.setupSuite](registerSuite);context[options.setup](registerSuite);context[options.teardown](registerSuite);context[options.teardownSuite](registerSuite);runTests.apply(this,arguments);context[options.setupSuite](cleanUp);context[options.teardown](cleanUp);context[options.teardownSuite](cleanUp);state.currentlyDefinedSuite=previousDefinedSuite})};function registerSuite(){state.currentTestContext=this}function wrapDefs(definition){return function(){return definition.call(state.currentTestContext)}}}},{"./lazy_var":6,"./symbol":7}],4:[function(require,module,exports){(function(global){var Mocha=typeof window!=="undefined"?window["Mocha"]:typeof global!=="undefined"?global["Mocha"]:null;var injectLazyVarInterface=require("../interface");function addInterface(rootSuite,options){var state={currentlyDefinedSuite:rootSuite};rootSuite.on("pre-require",function(context){var describe=context.describe;injectLazyVarInterface(context,state,options);context.describe.skip=function(title,fn){return describe.skip(title,function(){state.currentlyDefinedSuite=this;fn.apply(this,arguments)})};context.context=context.describe;context.context.only=context.describe.only=describe.only;context.xdescribe=context.xcontext=context.context.skip=context.describe.skip})}module.exports={createUi:function(name,options){options=options||{};options.inheritUi=options.inheritUi||"bdd";var ui=Mocha.interfaces[name]=function(rootSuite){Mocha.interfaces[options.inheritUi](rootSuite);return addInterface(rootSuite,options)};return ui}}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"../interface":3}],5:[function(require,module,exports){var interfaceBuilder=require("../mocha");var defineVariableOnce=require("../../define_var");var varPrefix="$";module.exports=interfaceBuilder.createUi("bdd-lazy-var/global",{onDefine:function(suite,variable,context){variable.name=varPrefix+variable.name;defineVariableOnce.for(suite,variable,context)}})},{"../../define_var":2,"../mocha":4}],6:[function(require,module,exports){var prop=require("./symbol").for;var lazyVarsPropName=prop("__lazyVars");var lazyVar={register:function(context,name,definition){var hasOwnVariable=context.hasOwnProperty(name)&&context.hasOwnProperty(lazyVarsPropName);if(hasOwnVariable&&lazyVar.isDefined(context,name)){throw new Error('Cannot define "'+name+'" variable twice in the same suite.')}var metadata=lazyVar.metadataFor(context);metadata.defs[name]=definition;lazyVar.defineProperty(context,name,metadata)},metadataFor:function(context){if(!context.hasOwnProperty(lazyVarsPropName)){var lazyVarsInPrototype=context[lazyVarsPropName]?context[lazyVarsPropName].defs:null;context[lazyVarsPropName]={defs:Object.create(lazyVarsInPrototype),created:{}}}return context[lazyVarsPropName]},defineProperty:function(context,name,metadata){Object.defineProperty(context,name,{configurable:true,get:function(){if(!metadata.created.hasOwnProperty(name)){var definition=metadata.defs[name];metadata.created[name]=typeof definition==="function"?definition():definition}return metadata.created[name]}})},isDefined:function(context,name){var hasLazyVars=context&&context[lazyVarsPropName];return!!(hasLazyVars&&context[lazyVarsPropName].defs[name])},cleanUp:function(context){if(context.hasOwnProperty(lazyVarsPropName)){context[lazyVarsPropName].created={}}}};module.exports=lazyVar},{"./symbol":7}],7:[function(require,module,exports){var indentity=function(value){return value};module.exports={"for":typeof Symbol==="undefined"?indentity:Symbol.for}},{}]},{},[1]);
