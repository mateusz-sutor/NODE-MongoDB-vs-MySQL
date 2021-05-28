const fs = require('fs');

const MongoDB = require('./db/mongoDB');
const Mongodb = new MongoDB('mongodb://127.0.0.1:27017', 'mongo-test', 'entries');

const MysqlDB = require('./db/mysqlDB');
const Mysqldb = new MysqlDB('localhost', 'root', '', 'mysql-test', 'entries');

const {createEntries: createMongoEntries, document: simpleMongoEntry} = require('./data/mongoEntries');
const {createEntries: createMysqlEntries, document: simpleMysqlEntry} = require('./data/mysqlEntries');

const args = process.argv.slice(2);

const number_of_loop = Number(args[0] ?? 5);
const number_of_users = Number(args[1] ?? 10);
const number_of_entries_by_user = Number(args[2] ?? 10);

if(!number_of_entries_by_user || !number_of_users || !number_of_loop) {
  console.error('Invalid command line arguments');
  process.exit(1);
}

const mongoEntries = createMongoEntries(number_of_users, number_of_entries_by_user);
const mysqlEntries = createMysqlEntries(number_of_users, number_of_entries_by_user);

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getTime = (time) => {
  return text => {
   return `${text} ${time[0]}s ${time[1] / 1_000_000}ms \n`;
  }
}

const measureTime = (time) => {
  //return time in nano seconds
  return text => {
    return {
      name: text,
      time : time[0] * 1_000_000_000 + time[1]
    }
  }
}

async function test_mongo(userID, sufix){
  const array = [];

  const time1 = await Mongodb.select(userID, 'latest', measureTime);
  array.push(time1('Select latest time - Mongo' + sufix));

  const time2 = await Mongodb.select(userID, '10latest', measureTime);
  array.push(time2('Select 10 latest time - Mongo' + sufix));

  const time3 = await Mongodb.select(userID, 'allJune', measureTime);
  array.push(time3('Select all from June time - Mongo' + sufix));

  const time4 = await Mongodb.select(userID, '10June', measureTime);
  array.push(time4('Select 10 from June time - Mongo' + sufix));

  const [time5, id] = await Mongodb.insertOne(simpleMongoEntry, measureTime);
  array.push(time5('Insert one time - Mongo' + sufix));

  const time6 = await Mongodb.update(id, measureTime);
  array.push(time6('Update latest added time - Mongo' + sufix));

  const time7 = await Mongodb.deleteOne(id, measureTime);
  array.push(time7('Delete latest added time - Mongo' + sufix));

  return array;

}

async function test_mysql(userID, sufix){

  const array = [];

  const time11 = await Mysqldb.select(userID, 'latest', measureTime);
  array.push(time11('Select latest time - Mysql' + sufix));

  const time22 = await Mysqldb.select(userID, '10latest', measureTime);
  array.push(time22('Select 10 latest time - Mysql' + sufix));

  const time33 = await Mysqldb.select(userID, 'allJune', measureTime);
  array.push(time33('Select all from June time - Mysql' + sufix));

  const time44 = await Mysqldb.select(userID, '10June', measureTime);
  array.push(time44('Select 10 from June time - Mysql' + sufix));

  const [time55, id] = await Mysqldb.insertOne(simpleMysqlEntry, measureTime);
  array.push(time55('Insert one time - Mysql' + sufix));

  const time66 = await Mysqldb.update(id, measureTime);
  array.push(time66('Update latest added time - Mysql' + sufix));

  const time77 = await Mysqldb.deleteOne(id, measureTime);
  array.push(time77('Delete latest added time - Mysql' + sufix));

  return array;
}

async function run() {
    try {

      const sum = [];

      async function go_test(prefix = ''){
        let i = number_of_loop;
        while(i > 0){
          const userID = getRandomInt(0, number_of_users);
          const mongo_array = await test_mongo(userID, prefix);
          const mysql_array =  await test_mysql(userID, prefix);
          [...mongo_array, ...mysql_array].forEach( el => {
            (sum[el.name] = sum[el.name] ? sum[el.name] : []).push(el.time);
          });
          i--;
        }
      }

      await Mongodb.connect();
      await Mysqldb.connect();

      //let text = "Results of test: \n";

      const time0 = await Mongodb.insert(mongoEntries, getTime);
      //text += time0('Mongo insert huge collection time: ');

      const time00 = await Mysqldb.insert(mysqlEntries, getTime);
      //text += time00('Mysql insert huge collection time: ');

      await go_test();

      await Mongodb.addDateIndex();
      await Mysqldb.addDateIndex();

      await go_test('Index');

      await Mongodb.drop();
      await Mysqldb.drop();

      return sum;

    } finally {
      // Ensures that the client will close when you finish/error
      await Mongodb.disconnect();
      await Mysqldb.disconnect();
    }
}
run().then( result => {
  let output = '';
  for(let i in result){
    result[i] = result[i].reduce( (prev, next) => {
      return prev + next;
    }, 0) / result[i].length;
    output += `${i}\n${result[i]}\n`;
  }
  const records = number_of_entries_by_user * number_of_users;
  fs.writeFile(`results/${records}`, output, err => {
    if (err) throw new Error(err);
    console.log(`Done ${records}`);
  });
}).catch(error => console.error("Error: " + error));

