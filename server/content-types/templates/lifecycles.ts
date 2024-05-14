export default {
  beforeCreate: async (event) => {
    const { data, where, select, populate } = event.params;
    if (data.originCode) {
      const { compiledCode, html } = await strapi.plugin('strapi-react-email')
        .service('reactEmail').transpileFromData(data.originCode, data.testData);
      data.transpiledCode = compiledCode;
    }
  },

  beforeUpdate: async (event) => {
    const { data, where, select, populate } = event.params;

    if (data.originCode) {
      const { compiledCode, html } = await strapi.plugin('strapi-react-email')
        .service('reactEmail').transpileFromData(data.originCode, data.testData);
      data.transpiledCode = compiledCode;
    }
  },
};
