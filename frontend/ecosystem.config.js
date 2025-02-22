module.exports = {
    apps: [{
      name: 'fruition',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://us-central1-fruition-4e3f8.cloudfunctions.net/api'
      }
    }]
  }