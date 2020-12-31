const Hapi = require('@hapi/hapi');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
require('dotenv').config();

const handler = async (req, h) => {
    const {project, env, password} = req.payload;
    const scriptPath = `${process.env.COMMON_PATH}/${project}/${env}/${project}/${process.env.SCRIPT_NAME}`;

    try {
        if (!project || !env || !password) {
            console.log(`Failed to pass in necessary payload. Payload received: ${JSON.stringify(req.payload)}`);
            return h.response('Failed to pass in necessary payload').code(400);
        }

        await exec(`bash ${scriptPath}`);
        
        return h.response(`Successfully ran deployment script at ${scriptPath}`).code(200);
    } catch (error) {
        if (error.message.includes('No such file or directory')) {
            console.log(`Deployment script not found at path ${scriptPath}`);
            return h.response('Deployment script not found at specified path.').code(400);
        }

        console.log(`An unhandled error occurred. ${error}`);
        return h.response('An unhandled error occurred').code(400);
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
        handler
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

init();
