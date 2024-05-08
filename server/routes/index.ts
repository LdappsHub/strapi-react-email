export default [
  {
    method: 'PUT',
    path: '/get-html/:id',
    handler: 'reactEmail.transpileAndTest',
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
