export default [
  {
    method: 'PUT',
    path: '/get-html/:id',
    handler: 'reactEmail.transpile',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/send-test-email/:id',
    handler: 'reactEmail.sendTestEmail',
    config: {
      policies: [],
    },
  },
];
