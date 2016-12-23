module.exports = {
  name: 'Person',
  type: {
    type: 'object',
    optional: false,
    members: {
      firstName: {
        type: 'generic',
        name: 'T',
        optional: false
      }
    },
  },
  params: [{
    name: 'T', bound: null
  }]
};
