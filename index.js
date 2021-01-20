const Hapi = require('@hapi/hapi');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
require('dotenv').config();

const handler = (req, h) => {
    try {
        const {project, env, password} = req.payload;
        const scriptPath = `${process.env.COMMON_PATH}/${project}/${env}/${project}/${process.env.SCRIPT_NAME}`;

        if (!project || !env || !password) {
            console.log(`${new Date()} Failed to pass in necessary payload. Payload received: ${JSON.stringify(req.payload)}`);
            return h.response('Failed to pass in necessary payload').code(400);
        }
        
        exec(`bash ${scriptPath} > ${process.env.LOGS_PATH} 2>&1`);
        
        console.log(`${new Date()} Successfully ran deployment script at ${scriptPath}`);
        return h.response(`Successfully ran deployment script at ${scriptPath}`).code(200);
    } catch (error) {
        if (error.message.includes('No such file or directory')) {
            console.log(`${new Date()} Deployment script not found at path ${scriptPath}`);
            return h.response('Deployment script not found at specified path.').code(400);
        }

        console.log(`${new Date()} An unhandled error occurred. ${error}`);
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
        path: '/deploy',
        handler
    });

    await server.start();
    console.log(`${new Date()} Deployment webhooks server started on ${server.info.uri}`);
};

init();
