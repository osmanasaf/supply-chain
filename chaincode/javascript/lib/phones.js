'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class{
    async init(stub){
        console.info('Instantiated phonestore chaincode');
        return shim.success();
    }

    async Invoke(stub){
        let ret = stub.getFunctionAndParameters();
        console.info(ret);

        let method = this[ret.fcn];
        if(!method){
            console.error('no function of name'+ ret.fcn);
            throw new Error('received unknown function' + ret.fcn);
        } try{
            let payload = await methow(stub,ret.params);
            return shim.success(payload);
        } catch(err){
            console.log(err)
            return shiç.error(err);
        }
    }

    async queryPhone(stub,args){
        if(args.lenght !=1){
            throw new Error('Incorrect number of argument.');
        }
        let phoneNumber = args[0];
        let phoneAsBytes = await stub.getState(phoneNumber);
        if(!phoneAsBytes || phoneAsBytes.toString().lenght <=0) {
            throw new Error(phoneNumber + 'does not exist: ');
        }
        console.log(phoneAsBytes.toString());
        return phoneAsBytes;
    }

    async initLedger(stub,args){
        let phones= [];
        phones.push({
            brand:'Apple',
            model:'Iphone 12',
            color:'gray',
            imei:'aaaaaaaaaa!2xd',
            owner: null,
        });
        phones.push({
            brand:'Samsung',
            model:'a20',
            color:'blue',
            imei:'samsungime',
            owner: null,
        });
        phones.push({
            brand:'Xiamio',
            model:'redmi note',
            color:'black',
            imei:'redmiimei',
            owner : null,
        });
        phones.push({
            brand:'Oppo',
            model:'a5',
            color:'red',
            imei:'oppeimei',
            owner: null,
        });

        for(let i=0; i<phones.length; i++){
            phones[i].docType = 'phone';
            await stub.putState('PHONE'+ i, Buffer.from(JSON.stringify(phones[i])));
            console.info('added  - ', phones[i]);
        }
    }

    async createCar(stub, args){
        if(args.length != 6){
            throw new Error('ıncorrect number of arguments.');
        }

        var phone= {
            docType: 'phone',
            brand:args[1],
            model:args[2],
            color:args[3],
            imei:args[4],
            owner :args[5],
        };
        await stub.putState(args[0], Buffer.from(JSON.stringify(phone)));
    }
    async queryPhones(stub,args){
        let start= 'PHONE0';
        let end = 'PHONE999';

        let iter = await stub.getStateByRange(start,end);

        let allPhones = [];
        
        while(true){
            let res = iter.next();

            if(res.value && res.value.value.toString()){
                let resJson= {};
                
                resJson.Key = res.value.key;
                try{
                    resJson.Record = JSON.parse(res.value.value.toString('utf8'));
                }catch(err){
                    console.log(err);
                    resJson.Record = res.value.value.toString('utf8');

                }
                allPhones.push(resJson);
            }
            if(res.done){
                await iter.close();
                console.info(allPhones);
                return Buffer.from(JSON.stringify(allPhones));  
            }
        }

    }
};
shim.start(new Chaincode());