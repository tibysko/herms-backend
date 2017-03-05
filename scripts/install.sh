#!/bin/bash
REMOTE_IP="$1"
REMOTE_USER="$2"
INSTALL_PATH="~/herms/backend"

REMOTE="$REMOTE_USER@$REMOTE_IP" 

# Main progrma
ssh $REMOTE "mkdir -p $INSTALL_PATH"

echo "SCP files in root repo..."
scp -Cq ../* $REMOTE:$INSTALL_PATH

echo "SCP ./src ..."
scp -rCq ../src $REMOTE:$INSTALL_PATH

echo "Running npm install.. this may take a while.."
ssh $REMOTE "cd $INSTALL_PATH && npm install"

echo "Removing backend from PM2..."
ssh $REMOTE "cd $INSTALL_PATH && pm2 delete Backend ./ecosystem.config.js"
echo "Starting backend..."
ssh $REMOTE "cd $INSTALL_PATH && pm2 start ./ecosystem.config.js"

echo "---------------------------------"
echo "       install done              "
echo "---------------------------------"