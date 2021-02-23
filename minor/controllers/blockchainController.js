'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

const walletPath = path.join(__dirname, '..', 'wallet');

/**
 *
 * @param {*} FabricCAServices
 * @param {*} ccp
 */
const buildCAClient = (FabricCAServices, ccp, caHostName) => {
    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities[caHostName]; //lookup CA details from config
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    console.log(`Built a CA Client named ${caInfo.caName}`);
    return caClient;
};

const buildCCP = () => {
    // load the common connection configuration file
    const ccpPath = path.resolve(__dirname, '..', '..', 'hosp-network', 'organizations', 'peerOrganizations', `${process.env.ORGANIZATION}.example.com`, `connection-${process.env.ORGANIZATION}.json`);
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
    }
    const contents = fs.readFileSync(ccpPath, 'utf8');

    // build a JSON object from the file contents
    const ccp = JSON.parse(contents);
    // const contract = network.getContract('reporting');
    // const result = awit 

    console.log(`Loaded the network configuration located at ${ccpPath}`);
    return ccp;
};

function prettyJSONString(inputString) {
    return JSON.parse(inputString);
}


const buildWallet = async (Wallets, walletPath) => {
    // Create a new  wallet : Note that wallet is for managing identities.
    let wallet;
    if (walletPath) {
        wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Built a file system wallet at ${walletPath}`);
    } else {
        wallet = await Wallets.newInMemoryWallet();
        console.log('Built an in memory wallet');
    }

    return wallet;
};

const enrollAdmin = async () => {
    try {
        const ccp = buildCCP();
        const caClient = buildCAClient(FabricCAServices, ccp, `ca_${process.env.ORGANIZATION}`);
        const wallet = await buildWallet(Wallets, walletPath);
        const identity = await wallet.get(process.env.ADMIN_USERID);
        if (identity) {
            console.log('An identity for the admin user already exists in the wallet');
            throw new Error('An identity for the admin user already exists in the wallet');
        }

        const enrollment = await caClient.enroll({ enrollmentID: process.env.ADMIN_USERID, enrollmentSecret: process.env.ADMIN_USERPW });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: process.env.MSPID,
            type: 'X.509',
        };
        await wallet.put(process.env.ADMIN_USERID, x509Identity);
    } catch (error) {
        console.error(`Failed to enroll admin user : ${error}`);
        throw new Error(`Failed to enroll admin user : ${error}`);
    }
};

const registerAndEnrollUser = async (req, _res, next) => {
    try {

        const { userId } = req.body;

        const ccp = buildCCP();
        const caClient = buildCAClient(FabricCAServices, ccp, `ca_${process.env.ORGANIZATION}`);
        const wallet = await buildWallet(Wallets, walletPath);

        const userIdentity = await wallet.get(userId);
        if (userIdentity) {
            throw new Error(`An identity for the user ${userId} already exists in the wallet`);
        }

        const adminIdentity = await wallet.get(process.env.ADMIN_USERID);
        if (!adminIdentity) {
            console.log('An identity for the admin user does not exist in the wallet');
            console.log('Enroll the admin user before retrying');
            throw new Error('An identity for the admin user does not exist in the wallet. Enroll the admin user before retrying')
        }
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, process.env.ADMIN_USERID);

        const secret = await caClient.register({
            affiliation: process.env.AFFILIATION,
            enrollmentID: userId,
            role: 'client'
        }, adminUser);
        const enrollment = await caClient.enroll({
            enrollmentID: userId,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: process.env.MSPID,
            type: 'X.509',
        };
        await wallet.put(userId, x509Identity);
        req.ca = x509Identity;

        return next();
    } catch (error) {
        console.error(`Failed to register user : ${error}`);
        next(error);
    }
};

const invokeChaincode = async (req, _res, next) => {
    try {
        const funcName = req.blockchainFunc;
        const ccp = buildCCP();
        const wallet = await buildWallet(Wallets, walletPath);
        const gateway = new Gateway();

        try {
            await gateway.connect(ccp, {
                wallet,
                identity: req.headers.user,
                discovery: { enabled: true, asLocalhost: false }
            });
            const network = await gateway.getNetwork(process.env.CHANNEL_NAME);
            const contract = network.getContract(process.env.CHAINCODE_NAME);

            await contract.submitTransaction(funcName,
                // req.account._id,
                // req.account.from,
                // req.account.to,
                // req.account.amount,
                // req.account.paid,
                // req.account.timestamp);
            req.user._id,
            req.user.patient_name,
            req.user.doctors_name,
            req.user.weight,
            req.user.height,
            req.user.description);
            const result = await contract.evaluateTransaction(funcName, req.user._id);
            req.blockchain = prettyJSONString(result.toString());

            return next();
        } finally {
            gateway.disconnect();
        }
    } catch (error) {
        next(error);
    }
}

const queryChaincode = async (req, _res, next) => {
    try {
        const funcName = req.blockchainFunc;
        const ccp = buildCCP();
        const wallet = await buildWallet(Wallets, walletPath);
        const gateway = new Gateway();
        let result;
        try {
            await gateway.connect(ccp, {
                wallet,
                identity: req.headers.user,
                discovery: { enabled: true, asLocalhost: false }
            });
            const network = await gateway.getNetwork(process.env.CHANNEL_NAME);
            const contract = network.getContract(process.env.CHAINCODE_NAME);

            console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
            if (req.query.id) result = await contract.evaluateTransaction(funcName, req.query.id);
            else result = await contract.evaluateTransaction(funcName);

            console.log(`*** Result: ${prettyJSONString(result.toString())}`);

            req.blockchain = prettyJSONString(result.toString());
        } finally {
            // Disconnect from the gateway when the application is closing
            // This will close all connections to the network
            gateway.disconnect();
        }
        return next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    buildCAClient,
    enrollAdmin,
    registerAndEnrollUser,
    invokeChaincode,
    queryChaincode
}
