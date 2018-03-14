container='applead_web'
sleep 2
docker exec $container ./yii migrate --interactive=0 >> deploy.log