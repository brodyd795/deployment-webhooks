const Hapi = require('@hapi/hapi');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
require('dotenv').config();

const handler = async (request) => {
    const {project, env, password} = request.payload;
    const scriptPath = `${process.env.COMMON_PATH}/${project}/${env}/${project}/${process.env.SCRIPT_NAME}`;

    try {
        if (!project || !env || !password) {
            return `Failed to pass in necessary payload. Payload received: ${JSON.stringify(request.payload)}`;
        }

        await exec(`bash ${scriptPath}`);
        
        return `Successfully ran deployment script at ${scriptPath}`;
    } catch (error) {
        if (error.message.includes('No such file or directory')) {
            return `File not found at path ${scriptPath}`;
        }

        return `An unhandled error occurred. ${error}`
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
