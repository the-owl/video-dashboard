module.exports = {
  devServer: {
    proxy: {
      '/events': {
        target: 'http://localhost:8001',
        ws: true
      },
      '/cameras': {
        target: 'http://localhost:8001'
      },
      '/snapshots': {
        target: 'http://localhost:8001'
      }
    }
  }
};
