const MongoDB = require('./db/mongoDB');
const Mongodb = new MongoDB('mongodb://127.0.0.1:27017', 'mongo-test', 'entries');

const MysqlDB = require('./db/mysqlDB');
const Mysqldb = new MysqlDB('localhost', 'root', '', 'mysql-test', 'entries');

const {createEntries: createMongoEntries, document: simpleMongoEntry} = require('./data/mongoEntries');
const {createEntries: createMysqlEntries, document: simpleMysqlEntry} = require('./data/mysqlEntries');

const args = process.argv.slice(2);

const number_of_users = Number(args[0]) ?? 10;
const number_of_entries_by_user = Number(args[1]) ?? 10;

if(!number_of_entries_by_user || !number_of_users) {
  console.error('Invalid command line arguments');
  process.exit(1);
}

const mongoEntries = createMongoEntries(number_of_users, number_of_entries_by_user);
const mysqlEntries = createMysqlEntries(number_of_users, number_of_entries_by_user);

const getTime = (time) => {
  return text => {
   return `${text} ${time[0]}s ${time[1] / 1_000_000}ms \n`;
  }
}

async function run() {
    try {

      async function test_mongo(userID){

        let text = '';

        const time1 = await Mongodb.select(userID, 'latest', getTime);
        text += time1('Mongo select latest time: ');

        const time2 = await Mongodb.select(userID, '10latest', getTime);
        text += time2('Mongo select 10 latest time: ');

        const time3 = await Mongodb.select(userID, 'allJune', getTime);
        text += time3('Mongo select all from June time: ');

        const time4 = await Mongodb.select(userID, '10June', getTime);
        text += time4('Mongo select 10 from June time: ');

        const [time5, id] = await Mongodb.insertOne(simpleMongoEntry, getTime);
        text += time5('Mongo insert one time: ');

        const time6 = await Mongodb.update(id, getTime);
        text += time6('Mongo update latest added time: ');

        const time7 = await Mongodb.deleteOne(id, getTime);
        text += time7('Mongo delete latest added time: ');

        return text;

      }

      async function test_mysql(userID){

        let text = '';

        const time11 = await Mysqldb.select(userID, 'latest', getTime);
        text += time11('Mysql select latest time: ');

        const time22 = await Mysqldb.select(userID, '10latest', getTime);
        text += time22('Mysql select 10 latest time: ');

        const time33 = await Mysqldb.select(userID, 'allJune', getTime);
        text += time33('Mysql select all from June time: ');

        const time44 = await Mysqldb.select(userID, '10June', getTime);
        text += time44('Mysql select 10 from June time: ');

        const [time55, id] = await Mysqldb.insertOne(simpleMysqlEntry, getTime);
        text += time55('Mysql insert one time: ');

        const time66 = await Mysqldb.update(id, getTime);
        text += time66('Mysql update latest added time: ');

        const time77 = await Mysqldb.deleteOne(id, getTime);
        text += time77('Mysql delete latest added time: ');

        return text;
      }

      let text = "Results of test: \n";

      await Mongodb.connect();
      await Mysqldb.connect();

      const time0 = await Mongodb.insert(mongoEntries, getTime);
      text += time0('Mongo insert huge collection time: ');

      const time00 = await Mysqldb.insert(mysqlEntries, getTime);
      text += time00('Mysql insert huge collection time: ');

      const userID = 5;

      text += await test_mongo(userID)
      text += '================= \n';
      text += await test_mysql(userID)

      await Mongodb.addDateIndex();
      await Mysqldb.addDateIndex();

      text += '================= \n WITH INDEX \n================= \n';
      text += await test_mongo(userID)
      text += '================= \n';
      text += await test_mysql(userID)


      await Mongodb.drop();
      await Mysqldb.drop();

      return text;

    } finally {
      // Ensures that the client will close when you finish/error
      await Mongodb.disconnect();
      await Mysqldb.disconnect();
    }
}
run().then(
  result => console.log(result),
  error => console.error("Error: BIG BIG " + error)
);

