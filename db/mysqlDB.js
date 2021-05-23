const MYSQL = require('mysql2/promise');

const MysqlDB = class{

    #connection; #tableName;

    constructor(host, user, password, dbname, tableName){

        this.config = {
            host     : host,
            user     : user,
            password : password,
            database : dbname,
            charset : 'utf8_polish_ci'
        }
        this.#tableName = tableName;
    };

    async connect(){
        this.#connection = await MYSQL.createConnection(this.config);
    }

    async disconnect(){
        await this.#connection.end();
    }

    async insert(data, callback){

        const timeStart = process.hrtime();

        await this.#connection.query('CREATE TABLE IF NOT EXISTS `entries` ( `id` INT NOT NULL AUTO_INCREMENT , `user_id` INT NOT NULL , `date` DATETIME NOT NULL , `content` JSON NULL DEFAULT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB CHARSET=utf8 COLLATE utf8_polish_ci;');

        const {statement} = await this.#connection.prepare(`insert into ${this.#tableName} (user_id, date, content) values (?, ?, ?)`);
        // statement.parameters - array of column definitions, length === number of params, here 2
        // statement.columns - array of result column definitions. Can be empty if result schema is dynamic / not known
        // statement.id
        // statement.query

        for(const doc of data){
            await statement.execute([...Object.values(doc)]);
        }

        await statement.close();

        const timeEnd = process.hrtime(timeStart);
        return callback(timeEnd);
    }

}

module.exports = MysqlDB;
