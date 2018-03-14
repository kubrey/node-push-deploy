container='applead_web'
sleep 2
docker exec -it $container ./yii migrate --interactive=0 >> deploy.log