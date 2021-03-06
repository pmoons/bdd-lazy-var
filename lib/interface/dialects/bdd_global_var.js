const interfaceBuilder = require('../index');
const defineGetterOnce = require('../../define_var');

module.exports = interfaceBuilder.createUi('bdd-lazy-var/global', {
  onDefineVariable(suite, varName, context) {
    defineGetterOnce(context, varName, { getterPrefix: '$' });
  }
});
