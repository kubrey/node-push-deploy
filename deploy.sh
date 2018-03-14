#!/bin/bash

#accepts 4 agrs: 1 - gir work directory 2 - deployed branch 3 - repo directory 4 - files deployed 5 - container; 1 and 3 can not be empty

if [[ $# -ne 5 ]]
then
echo "invalid args"+$#+"\n" >> deploy.log
exit 1
fi
currdir=`pwd`
workingDir=$1
branch=$2
rep=$3
files=$4
container=$5
now=`date +%Y-%m-%d:%H:%M:%S`
echo "----------DEPLOY START-----------" >> deploy.log
echo "start deploy $now..." >> deploy.log

cd $rep
git fetch origin $branch

git --work-tree=$workingDir checkout -f $branch
commitHash=`git rev-parse --short HEAD`
cd $currdir
sleep 2
docker exec $container ./yii migrate --interactive=0 >> deploy.log 2>&1
#docker exec -it $container composer install >> deploy.log

nowUpdate=`date +%Y-%m-%d:%H:%M:%S`
echo "$nowUpdate Deployed branch: $branch Commit: $commitHash\n" >> deploy.log
echo "----------DEPLOY END-----------" >> deploy.log

if [[ files -ne '' ]]
then
echo "Files: $files\n\n" >> deploy.log
fi
