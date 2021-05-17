const MongoDB = require('./db/mongoDB');
const Mongodb = new MongoDB('mongodb://127.0.0.1:27017', 'mongo-test', 'entries');


const {createMongoEntries, document: simpleEntry} = require('./data/mongoEntries');
const number_of_users = 1000;
const number_of_entries_by_user = 1000;
const mongoEntries = createMongoEntries(number_of_users, number_of_entries_by_user);

const getTime = (time) => {
  return text => {
   return `${text} ${time[0]}s ${time[1] / 1_000_000}ms \n`;
  }
}

async function run() {
    try {

      let text = "Results of test: \n";

      await Mongodb.connect();

      /* ---------------- insert -------------------------------
      * insert prepared huge collection
      */

      const time0 = await Mongodb.insert(mongoEntries, getTime);
      text += time0('Mongo insert huge collection time: ');

      /* ---------------- select---------------------------------
       * select latest entry
       * select 10 latest entries
       * select all entires from June
       * select 10 entries from June
      */
      const userID = 5;

      const time1 = await Mongodb.select(userID, 'latest', getTime);
      text += time1('Mongo select latest time: ');

      const time2 = await Mongodb.select(userID, '10latest', getTime);
      text += time2('Mongo select 10 latest time: ');

      const time3 = await Mongodb.select(userID, 'allJune', getTime);
      text += time3('Mongo select all from June time: ');

      const time4 = await Mongodb.select(userID, '10June', getTime);
      text += time4('Mongo select 10 from June time: ');

      /* insert
      * insert 1 entry to collection
      */

      const {function: time5, id} = await Mongodb.insertOne(simpleEntry, getTime);
      text += time5('Mongo insert one time: ');

      /* update
      * update one first from June
      */

      const time6 = await Mongodb.update(userID, getTime);
      text += time6('Mongo update one first from June time: ');

      /* delete
      * delete one latest from June
      */
      const time7 = await Mongodb.deleteOne(userID, getTime);
      text += time7('Mongo delete one latest from June time: ');

      await Mongodb.drop();

      return text;

    } finally {
      // Ensures that the client will close when you finish/error
      await Mongodb.disconnect();
    }
}
run().then(
  result => console.log(result),
  error => console.error("Error: " + error)
);

