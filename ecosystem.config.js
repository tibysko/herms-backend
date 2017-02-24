module.exports = {

  "apps": [
    {
      "name": "Backend",
      "script": "src/server.js",
      "env": {
        "NODE_ENV": "production",
        "USB_PORT": "/dev/ttyACM0",
        "BACKEND_PORT": "8081",
        "BACKEND_WEBSOCKET_PORT": "8082"
      },

      "env_aws": {
        "MOCK": "true"
      }
    }
  ],

  "deploy": {
    "production": {
      "user": "pi",
      "host": "192.168.1.146",
      "ref": "origin/master",
      "repo": "https://github.com/tibysko/herms-backend.git",
      "path": "/home/pi/herms/backend",
      "exec_mode": "fork",
      "post-deploy": "npm install && pm2 startOrRestart ecosystem.config.js --env production"
    },
    "aws": {
      "user": "ubuntu",
      "host": "35.156.49.48",
      "port": "22",
      "ref": "origin/master",
      "repo": "https://github.com/tibysko/herms-backend.git",
      "path": "/home/ubuntu/herms/backend",
      "exec_mode": 'fork',
      "post-deploy": "npm install && pm2 startOrRestart ecosystem.config.js --env aws"
    }
  }
}
