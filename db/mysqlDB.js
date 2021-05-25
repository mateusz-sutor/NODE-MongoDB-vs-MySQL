const MYSQL = require('mysql2/promise');

const MysqlDB = class{

    #connection; #tableName;

    constructor(host, user, password, dbname, tableName){

        this.config = {
            host     : host,
            user     : user,
            password : password,
            database : dbname,
            timezone : 'local',
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

        for(const doc of data){
            await this.#connection.execute(`insert into ${this.#tableName} (user_id, date, content) values (?, ?, ?)`, [...Object.values(doc)]);
        }

        const timeEnd = process.hrtime(timeStart);
        return callback(timeEnd);

       /* const {statement} = await this.#connection.prepare(`insert into ${this.#tableName} (user_id, date, content) values (?, ?, ?)`);

        for(const doc of data){
          await statement.execute([...Object.values(doc)]);
        }

        const timeEnd = process.hrtime(timeStart);

        await statement.close();
        return callback(timeEnd);*/

    }

    async select(user_id, action, callback){
        let timeStart, timeEnd, result;

        const query_prefix = `select * from ${this.#tableName} where user_id = ?`;

        switch(action){
          case 'allJune': {
            timeStart = process.hrtime();
            const [rows]  = await this.#connection.query(`${query_prefix} and month(date) = 6 order by date desc`, [user_id]);
            timeEnd = process.hrtime(timeStart);
            //console.log(rows);
          }break;
          case '10June': {
            timeStart = process.hrtime();
            const [rows]  = await this.#connection.query(`${query_prefix} and month(date) = 6 order by date desc limit 10`, [user_id]);
            timeEnd = process.hrtime(timeStart);
            //console.log(rows);
          }break;
          case '10latest': {
            timeStart = process.hrtime();
            const [rows]  = await this.#connection.query(`${query_prefix} order by date desc limit 10`, [user_id]);
            timeEnd = process.hrtime(timeStart);
            //console.log(rows);
          }break;
          case 'latest':{
            timeStart = process.hrtime();
            const [rows]  = await this.#connection.query(`${query_prefix} order by date desc limit 1`, [user_id]);
            timeEnd = process.hrtime(timeStart);
            //console.log(rows);
          }break;
        }

        //console.log(result);
        return callback(timeEnd);
      }


    async insertOne(entry, callback){

        this.#connection.config.namedPlaceholders = true;
        const timeStart = process.hrtime();
        const [result] = await this.#connection.execute(`insert into ${this.#tableName} set user_id = ? , date = ? , content = ?`, [...Object.values(entry)]);
        const timeEnd = process.hrtime(timeStart);

        return [callback(timeEnd), result.insertId];
    }

    async update(id, callback){
        const content = {
            title: 'Title',
            description: 'What I did today?',
            mood: 'bad'
        };

        const timeStart = process.hrtime();

        const [result] = await this.#connection.execute(`update ${this.#tableName} set content = ? where id = ? `, [content, id]);
        //console.log(result);
        const timeEnd = process.hrtime(timeStart);
        return callback(timeEnd);
    }

    async deleteOne(id, callback){
        const timeStart = process.hrtime();

        await this.#connection.query(`delete from ${this.#tableName} where id = ?  `, [id]);

        const timeEnd = process.hrtime(timeStart);
        return callback(timeEnd);
    }

    async drop(){
        await this.#connection.query(`drop table ${this.#tableName}`);
    }

}

module.exports = MysqlDB;
