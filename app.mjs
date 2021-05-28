#!/usr/bin/env zx

const fs = require('fs');

const para = [
    [100, 100],   //10_000
    [100, 1000],  //100_000
    [100, 5000],  //500_000
    [1000, 1000], //1_000_000
    [1000, 2000], //2_000_000
];
try{
    const output = {};

    for(const el of para){

        await $`npm run test -- ${el[0]} ${el[1]}`;
        await sleep(1000);

        const name = el[0] * el[1];

        let prevline;
        fs.readFileSync(`./results/${name}`, 'utf-8').split(/\r?\n/).forEach( line => {
            if(Number(line[0])){
                const time = Math.floor(line / 1_000) / 1_000;
                output[prevline][name] = time + ' ms';
            }else{
                if(line){
                    output[line] = output[line] || {};
                    prevline = line;
                }
            }
        });


    }

    fs.writeFileSync('output.json', JSON.stringify(output));

}catch(err){
    console.log('Error: ' + err);
}



