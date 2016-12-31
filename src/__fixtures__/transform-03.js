// FIXME
module.exports = {
  name: `Person`,
  type: {
    type: `object`,
    optional: false,
    members: {
      friends: {
        type: 'array',
        elementType: {
          type: `generic`,
          name: `Person`,
          optional: false,
          args: []
        },
        optional: false,
      },
    },
  },
  params: [],
};
