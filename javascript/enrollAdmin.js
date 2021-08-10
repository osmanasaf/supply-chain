'use strict'

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
try {
    const caURL = ccp.certificateAuthorities['ca.loonycorn.com'].url;
    const ca = new FabricCAServices(caURL);

    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const adminExists = await wallet.exists('admin');
    if (adminExists) {
        console.log('An identity for the admin user "admin" already exists in the wallet');
        return;
    }

    const enrollment = await ca.enroll({enrollmentID: 'admin', enrollmentSecret: 'adminpw'});
    const id = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
    wallet.import('admin', id);
    console.log('admin created');
   
}   catch (error) {
    console.error(`${error}`);
    process.exit(1);
    }
 
} 

main();

