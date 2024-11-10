const env = process.env.NODE_ENV || 'production';

const EnvConfig = {
    development: {
        baseApi: '/api',
        dbUri: 'mongodb+srv://leave-app-db:leaveapp123@leave-app.h7hgjgd.mongodb.net/test?retryWrites=true&w=majority'
    },
    test: {
        baseApi: 'http://test.example.com/api',
        dbUri: 'mongodb+srv://leave-app-db:leaveapp123@leave-app.h7hgjgd.mongodb.net/test?retryWrites=true&w=majority'
    },
    production: {
        baseApi: 'https://api.example.com',
        dbUri: 'mongodb+srv://leave-app-db:leaveapp123@leave-app.h7hgjgd.mongodb.net/test?retryWrites=true&w=majority'
    }
};

export default {
    env,
    namespace: 'employee', 
    ...EnvConfig[env]
};