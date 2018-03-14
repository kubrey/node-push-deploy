const express = require('express');
const path = require('path');
const config = require(path.join(__dirname, "/src/config"));
console.log(config.get('server:port'));
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const util = require('util');
const winston = require('winston');
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            name: 'info-file',
            filename: 'deploy-info.log',
            level: 'info'
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'deploy-error.log',
            level: 'error'
        })
    ]
});

process.title = 'push-deploy';

const app = express();

app.use(bodyParser());
app.use(methodOverride());

app.get('/', function (req, res) {
    res.send("I'm working here.");
});

app.post('/deploy', function (req, res) {
    console.log('post detected...');
    let shellOptions = ['deploy.sh',
        config.get('git:work_dir'),
        config.get('git:branch'),
        config.get('git:repo_dir'),
        "",
        config.get('docker:container')
    ];

    if (req.headers['content-type'] === undefined || req.headers['content-type'].toLowerCase() !== 'application/json') {
        logger.log('error', "Invalid content-type; " + util.inspect(req.headers, false, null));
        res.status(400).send('Invalid content-type');
        return;
    }

    if(req.body.push === undefined){
       // logger.log('error', "Empty body - no push; " + util.inspect(req.body, false, null));
        res.status(400).send('Invalid body.');
        return;
    }



    let newChanges = req.body.push.changes;
    if (newChanges === undefined) {
        //logger.log('error', "No changes: " + util.inspect(req.body.push, false, null));
        res.status(400).send('No changes');
        return;
    }

    let update = false;

    for (let iteration in newChanges) {
        // console.log(newChanges[iteration]);
        if (newChanges[iteration].new.type === 'branch' && newChanges[iteration].new.name === config.get('git:branch')) {
            update = true;
            break;
        }
    }

    // console.log(update);

    if (update) {
        logger.log('info', "Update:" + util.inspect(req.headers, false, null));
         let child = require('child_process').spawn('/bin/bash', shellOptions, {stdio: 'inherit'});
         child.stderr.on('data', (data) => {
            logger.log('error', util.inspect(data, false, null));
        });
    } else {
        logger.log('error', "No update; " + util.inspect(newChanges, false, null));
    }
    res.send("Done");
});

app.listen(config.get('server:port'), function () {
    console.log('Start listen on ' + config.get('server:port') + '!');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// { push:
// { changes:
//     [ { forced: false,
//         old:
//             { type: 'branch',
//                 name: 'advanced-dev',
//                 links:
//                     { commits: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commits/advanced-dev' },
//                         self: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/refs/branches/advanced-dev' },
//                         html: { href: 'https://bitbucket.org/kubrey/apple-search-ad/branch/advanced-dev' } },
//                 target:
//                     { hash: 'ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0',
//                         links:
//                             { self: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commit/ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0' },
//                                 html: { href: 'https://bitbucket.org/kubrey/apple-search-ad/commits/ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0' } },
//                         author:
//                             { raw: 'Sergey Kubrey <kubrey.work@gmail.com>',
//                                 type: 'author',
//                                 user:
//                                     { username: 'kubrey',
//                                         type: 'user',
//                                         display_name: 'Sergey Kubrey',
//                                         uuid: '{33123a00-da41-4c8c-b348-0cecf36e43bc}',
//                                         links:
//                                             { self: { href: 'https://api.bitbucket.org/2.0/users/kubrey' },
//                                                 html: { href: 'https://bitbucket.org/kubrey/' },
//                                                 avatar: { href: 'https://bitbucket.org/account/kubrey/avatar/32/' } } } },
//                         parents:
//                             [ { type: 'commit',
//                                 hash: 'e9a748bd2a992a0cf43814a5394c2fdf3279a0b7',
//                                 links:
//                                     { self: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commit/e9a748bd2a992a0cf43814a5394c2fdf3279a0b7' },
//                                         html: { href: 'https://bitbucket.org/kubrey/apple-search-ad/commits/e9a748bd2a992a0cf43814a5394c2fdf3279a0b7' } } } ],
//                         date: '2017-07-12T06:37:45+00:00',
//                         message: 'update for deploy test+\n',
//                         type: 'commit' } },
//         links:
//             { commits: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commits?include=84724c82805913f3699e2009c0e5aae32dbf06ba&exclude=ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0' },
//                 html: { href: 'https://bitbucket.org/kubrey/apple-search-ad/branches/compare/84724c82805913f3699e2009c0e5aae32dbf06ba..ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0' },
//                 diff: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/diff/84724c82805913f3699e2009c0e5aae32dbf06ba..ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0' } },
//         truncated: false,
//         commits:
//             [ { hash: '84724c82805913f3699e2009c0e5aae32dbf06ba',
//                 links:
//                     { self: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commit/84724c82805913f3699e2009c0e5aae32dbf06ba' },
//                         comments: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commit/84724c82805913f3699e2009c0e5aae32dbf06ba/comments' },
//                         patch: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/patch/84724c82805913f3699e2009c0e5aae32dbf06ba' },
//                         html: { href: 'https://bitbucket.org/kubrey/apple-search-ad/commits/84724c82805913f3699e2009c0e5aae32dbf06ba' },
//                         diff: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/diff/84724c82805913f3699e2009c0e5aae32dbf06ba' },
//                         approve: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commit/84724c82805913f3699e2009c0e5aae32dbf06ba/approve' },
//                         statuses: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commit/84724c82805913f3699e2009c0e5aae32dbf06ba/statuses' } },
//                 author:
//                     { raw: 'Sergey Kubrey <kubrey.work@gmail.com>',
//                         type: 'author',
//                         user:
//                             { username: 'kubrey',
//                                 type: 'user',
//                                 display_name: 'Sergey Kubrey',
//                                 uuid: '{33123a00-da41-4c8c-b348-0cecf36e43bc}',
//                                 links:
//                                     { self: { href: 'https://api.bitbucket.org/2.0/users/kubrey' },
//                                         html: { href: 'https://bitbucket.org/kubrey/' },
//                                         avatar: { href: 'https://bitbucket.org/account/kubrey/avatar/32/' } } } },
//                 parents:
//                     [ { type: 'commit',
//                         hash: 'ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0',
//                         links:
//                             { self: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commit/ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0' },
//                                 html: { href: 'https://bitbucket.org/kubrey/apple-search-ad/commits/ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0' } } } ],
//                 date: '2017-07-12T06:43:47+00:00',
//                 message: 'update for deploy test+\n',
//                 type: 'commit' } ],
//         created: false,
//         closed: false,
//         new:
//             { type: 'branch',
//                 name: 'advanced-dev',
//                 links:
//                     { commits: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commits/advanced-dev' },
//                         self: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/refs/branches/advanced-dev' },
//                         html: { href: 'https://bitbucket.org/kubrey/apple-search-ad/branch/advanced-dev' } },
//                 target:
//                     { hash: '84724c82805913f3699e2009c0e5aae32dbf06ba',
//                         links:
//                             { self: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commit/84724c82805913f3699e2009c0e5aae32dbf06ba' },
//                                 html: { href: 'https://bitbucket.org/kubrey/apple-search-ad/commits/84724c82805913f3699e2009c0e5aae32dbf06ba' } },
//                         author:
//                             { raw: 'Sergey Kubrey <kubrey.work@gmail.com>',
//                                 type: 'author',
//                                 user:
//                                     { username: 'kubrey',
//                                         type: 'user',
//                                         display_name: 'Sergey Kubrey',
//                                         uuid: '{33123a00-da41-4c8c-b348-0cecf36e43bc}',
//                                         links:
//                                             { self: { href: 'https://api.bitbucket.org/2.0/users/kubrey' },
//                                                 html: { href: 'https://bitbucket.org/kubrey/' },
//                                                 avatar: { href: 'https://bitbucket.org/account/kubrey/avatar/32/' } } } },
//                         parents:
//                             [ { type: 'commit',
//                                 hash: 'ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0',
//                                 links:
//                                     { self: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad/commit/ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0' },
//                                         html: { href: 'https://bitbucket.org/kubrey/apple-search-ad/commits/ec2a016da78d2b7a3d0f4b45beb313cb9407f9c0' } } } ],
//                         date: '2017-07-12T06:43:47+00:00',
//                         message: 'update for deploy test+\n',
//                         type: 'commit' } } } ] },
//     actor:
//     { username: 'kubrey',
//         type: 'user',
//         display_name: 'Sergey Kubrey',
//         uuid: '{33123a00-da41-4c8c-b348-0cecf36e43bc}',
//         links:
//         { self: { href: 'https://api.bitbucket.org/2.0/users/kubrey' },
//             html: { href: 'https://bitbucket.org/kubrey/' },
//             avatar: { href: 'https://bitbucket.org/account/kubrey/avatar/32/' } } },
//     repository:
//     { scm: 'git',
//         website: '',
//         name: 'apple-search-ad',
//         links:
//         { self: { href: 'https://api.bitbucket.org/2.0/repositories/kubrey/apple-search-ad' },
//             html: { href: 'https://bitbucket.org/kubrey/apple-search-ad' },
//             avatar: { href: 'https://bitbucket.org/kubrey/apple-search-ad/avatar/32/' } },
//         full_name: 'kubrey/apple-search-ad',
//             owner:
//         { username: 'kubrey',
//             type: 'user',
//             display_name: 'Sergey Kubrey',
//             uuid: '{33123a00-da41-4c8c-b348-0cecf36e43bc}',
//             links:
//             { self: { href: 'https://api.bitbucket.org/2.0/users/kubrey' },
//                 html: { href: 'https://bitbucket.org/kubrey/' },
//                 avatar: { href: 'https://bitbucket.org/account/kubrey/avatar/32/' } } },
//         type: 'repository',
//             is_private: true,
//         uuid: '{509c5c72-1bbe-4314-ad78-29c29605bd76}' } }