const mysql = require('mysql2');
require('dotenv').config();
const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;
require('events').EventEmitter.defaultMaxListeners = 20;
const logger = require(`../../util/Logger`);

//Note: https://stackoverflow.com/questions/18496540/node-js-mysql-connection-pooling/18496936

let pool = mysql.createPool({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/*
let DB = (function () {

    function _query(query, params, callback) {
        
        pool.getConnection(async function (err, connection) {
            if (err) {
                connection.release();
                callback(err, null);
                throw err;
            }
            logger.info('MySQL Connection Established: ', connection.threadId);
            connection.query(query, params, function (err, rows) {
                
                connection.release();
                if (!err) {
                    console.log('User Query Results: ', rows);
                    logger.error('User Query Results: ', rows);
                    callback(err, rows);
                }
                else {
                    console.log('Error: ', err);
                    logger.error('Error: ', err);
                    callback(err, null);
                }

            });

            connection.on('error', function (err) {
                connection.release();
                callback(null, err);
                throw err;
            });
        });
    }

    return {
        query: _query
    };
})();
*/

async function getDataFromDB(query) {
    try{
        return new Promise(function(resolve){
            pool.query(query, async function (err, result, fields) {
                if(result === undefined){
                    logger.error(`[getDataFromDB]: result undefined ${err}`)
                    return;
                } else {
                    resolve(result);
                }
            })
        })
    }catch(e){
        logger.error(`(pool::run) something went wrong: ${e}`);
        return;
    }
}

module.exports = {
    getDataFromDB
};