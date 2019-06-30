module.exports = {
  devServer: {
    proxy: {
      '/events': {
        target: 'http://localhost:8000',
        ws: true
      },
      '/cameras': {
        target: 'http://localhost:8000'
      },
      '/snapshots': {
        target: 'http://localhost:8000'
      }
    }
  }
};
