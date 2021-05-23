Date.prototype.toMysqlFormat = function() {
    return this.toISOString().slice(0, 19).replace('T', ' ');
};

const document = {
    user_id:  Date.now(),
    date: new Date(2022,4,25).toMysqlFormat(),
    content: {
        title: 'Title',
        description: 'What I did today?',
        mood: 'good'
    }
};

const createEntries = (number_of_users, number_of_entries_by_user) => {

    //create basicEntires array
    const basicEntries = [];

    let date = new Date(2021,4,25);
    for(let i = 0; i < number_of_entries_by_user; i++){

    for(let j = 0; j <number_of_users; j++){

        basicEntries.push({
        user_id: j,
        date: new Date(date).toMysqlFormat(),
        content: {
            title: 'Title',
            description: 'What I did today?',
            mood: 'good'}
        });
    }
    //add one day
    date.setDate(date.getDate() + 1 );

    }

    return basicEntries;
}

module.exports = {createEntries, document};