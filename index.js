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

        exec(`bash ${scriptPath}`, (error) => {
            if (error) {
                if (error.message.includes("No such file or directory")) {
                    console.log('File not found: ', scriptPath);
                } else {
                    console.log(`Unhandled error while running deployment script ${scriptPath}: `, error);
                }
            }
        });
    
        return {
            project,
            env,
            password
        };
    } catch (error) {
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
