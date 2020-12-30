const Hapi = require('@hapi/hapi');
const {exec} = require('child_process');
require('dotenv').config();

const handler = (request, h) => {
    try {
        const {project, env, password} = request.payload;

        if (!project || !env || !password) {
            throw new Error("Didn't pass in correct stuff.");
        }

        const scriptPath = `${process.env.COMMON_PATH}/${project}/${env}/${project}/${process.env.SCRIPT_NAME}`;

        exec(`bash ${scriptPath}`, (err, stdout, sterr) => {
	    console.log('stdout: ', stdout);
	    console.log('sterr: ', sterr);
            console.log('scriptPath', scriptPath);
            if (err !== null) {
                console.log('exec err: ', err);
            }
        });
    
        return {
            project,
            env,
            password
        };
    } catch (error) {
        return `An error occurred. ${error}`
    }
}

const init = async () => {

    const server = Hapi.server({
        port: 8082,
        host: 'localhost'
    });

    server.route({
        method: 'POST',
        path: '/',
        handler: handler
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
