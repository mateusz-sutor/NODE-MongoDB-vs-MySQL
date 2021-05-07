
const createMongoEntries = (number_of_users, number_of_entries_by_user) => {

    //create basicEntires array
    const basicEntries = [];

    let date = new Date(2021,4,25);
    for(let i = 0; i < number_of_entries_by_user; i++){

    for(let j = 0; j <number_of_users; j++){

        basicEntries.push({
        _id_user: j,
        date: new Date(date),
        title: 'Title',
        description: 'What I did today?',
        mood: 'good'
        });
    }
    //add one day
    date.setDate(date.getDate() + 1 );

    }

    return basicEntries;
}

module.exports = createMongoEntries;