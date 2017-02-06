module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: "Backend",
      script: "src/server.js"
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
      production: {
      user: "pi",
      host: "192.168.1.146",
      ref: "origin/master",
      repo: "https://github.com/tibysko/herms-backend.git",
      path: "/home/pi/herms/backend",
      exec_mode: 'fork',
      "post-deploy": "npm install && pm2 startOrRestart ecosystem.config.js --env production",
      env: {
        NODE_ENV: "production",
        USB_PORT: "/dev/ttyACM0",
        BACKEND_PORT: 8081,
        BACKEND_WEBSOCKET_PORT: 8082

      }
    },
    dev: {
      user: "node",
      host: "192.168.99.100",
      port: "22022",
      ref: "origin/master",
      repo: "https://github.com/tibysko/herms-backend.git",
      path: "/home/node/backend",
      exec_mode: 'fork',
      "post-deploy": "npm install && pm2 startOrRestart ecosystem.config.js",
      env: {
        USB_PORT: "com3",
        BACKEND_PORT: 8081,
        BACKEND_WEBSOCKET_PORT: 8082
      }
    }
  }
}
