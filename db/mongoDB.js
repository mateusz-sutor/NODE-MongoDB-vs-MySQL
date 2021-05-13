const { MongoClient } = require("mongodb");


const MongoDB = class {

    #client; #dbname; #collection;

    constructor(url, dbname, collection){
        this.#client = new MongoClient(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        this.#dbname = dbname;
        this.#collection = collection;
    }

    async connect(){
        await this.#client.connect();
        this.#setAttributes();
    }

    async disconnect(){
        await this.#client.close();
    }

    #setAttributes(){
        const database = this.#client.db(this.#dbname);
        this.#collection = database.collection(this.#collection);
    }

    async insert(entries, callback){
      const timeStart = process.hrtime();
      await this.#collection.insertMany(entries);
      const timeEnd = process.hrtime(timeStart);
      return callback(timeEnd);
    }

    async select(user_id, action, callback){
      let timeStart, timeEnd, result;

      switch(action){
        case 'allJune': {
            [result, timeEnd] = await this.#selectJune(user_id);
            //console.log(result);
        }break;
        case '10June': {
            [result, timeEnd] = await this.#selectJune(user_id, {
                sort : {date: -1},
                limit: 10
            });
            //console.log(result)
        }break;
        case '10latest': {

            [result, timeEnd] = await this.#selectLatest(user_id, {
                sort : {date: -1},
                limit: 10
            });


        }break;
        case 'latest':{

            timeStart = process.hrtime();
            result = await this.#collection.findOne({
                _id_user: user_id,
                }, {
                sort : {date: -1}
                });
            timeEnd = process.hrtime(timeStart);
            /*[result, timeEnd] = await this.#selectLatest(user_id, {
                sort : {date: -1},
                limit: 1
            });*/

        }break;
      }

      //console.log(result);
      return callback(timeEnd);
    }

    async #selectJune(user_id, opt = {}){
        const query = {
            _id_user: user_id,
            date: {
                //get only from June
                $gte: new Date(2021,5),
                $lt: new Date(2021,6),
            }};
        const timeStart = process.hrtime();
        let result = await this.#collection.find(query, opt).toArray();
        const timeEnd = process.hrtime(timeStart);
       return [result, timeEnd];
    }

    async #selectLatest(user_id, opt = {}){
        const timeStart = process.hrtime();
        let result = await this.#collection.find({
            _id_user: user_id,
            }, opt).toArray();
        const timeEnd = process.hrtime(timeStart);
        return [result, timeEnd];
    }

    update(fields){

    }
}

module.exports = MongoDB;