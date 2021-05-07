const MongoDB = require('./db/mongoDB');
const Mongodb = new MongoDB('mongodb://127.0.0.1:27017', 'mongo-test', 'entries');


const createMongoEntries = require('./data/mongoEntries');
const number_of_users = 10;
const number_of_entries_by_user = 10;
const mongoEntries = createMongoEntries(number_of_users, number_of_entries_by_user);

const getTime = (time) => {
  return text => {
   return `${text} ${time[0]}s ${time[1] / 1_000_000}ms`;
  }
}

async function run() {
    try {

      await Mongodb.connect();


      /* ---------------- insert -------------------------------
      * insert prepared huge collection
      * insert 1 entry to collection
      * insert 10 entries to collection
      */

      const time1 = await Mongodb.insert(mongoEntries, getTime);
      console.log(time1('Mongo insert time: '));

      /* ---------------- select---------------------------------
       * select latest entry
       * select 10 latest entries
       * select all entires from June
       * select 10 entries from June
      */
      const userID = 5;

      const time2 = await Mongodb.select(userID, 'allJune', getTime);
      console.log(time2('Mongo select all from June time: '));

      const time3 = await Mongodb.select(userID, '10June', getTime);
      console.log(time3('Mongo select 10 from June time: '));
      //update


      //delete


      //insert

      return 'jejeje';

    } catch (err) {
        console.log("Error: " + err);
    } finally {
      // Ensures that the client will close when you finish/error
      await Mongodb.disconnect();
    }
}
run().then(res => {
  console.log(res);
});

