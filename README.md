# dcorejs-lib

> This library is combined forks of [graphenejs-lib](https://github.com/svk31/graphenejs-lib) 
and [graphenejs-ws](https://github.com/svk31/graphenejs-ws). 


Pure JavaScript library for node.js and browsers. Can be used to construct, sign and broadcast transactions in 
JavaScript, and to easily obtain data from the DCore blockchain via public APIs.

[![npm version](https://img.shields.io/npm/v/graphenejs-lib.svg?style=flat-square)](https://www.npmjs.com/package/dcorejs-lib)
[![npm downloads](https://img.shields.io/npm/dm/graphenejs-lib.svg?style=flat-square)](https://www.npmjs.com/package/graphenejs-lib)

## Setup

This library can be obtained through npm:
```
npm install dcorejs-lib
```

## Usage

Next examples showing basic usage of dorejs-lib library for manipulation and fetching of DCore blockchain objects.

### Initialization

Example shows how to initialize library and connect to DCore deamon Apis.

```javascript
    var {Apis, ChainConfig} = require('dcorejs-lib');
    var dcoreWsAddress = 'wss://dcore.address.com';
    
    ChainConfig.networks.decent = {
        chainId: 'your_dcore_chain_id'
    };
    
    Apis.instance(dcoreWsAddress, true).init_promise
        .then(result => {
            // now connected to DCore daemon, can run some commands
        })
        .catch(err => {
            // error connecting to DCore daemon ws interface
        });
```

### Chain

This library provides utility functions to handle blockchain objects.

```javascript
    var {Apis, ChainStore, FetchChain} = require('dcorejs-lib');
    
    Apis.instance().init_promise
        .then(res => {
            ChainStore.init()
                .then(() => {
                    FetchChain('getAccount', '1.2.30')
                        .then(res => {
                            // object successfully fetched, process DCore network object
                        })
                        .catch(err => {
                            // error fetching object from DCore blockchain
                        });
                })
                .catch(err => {
                    // error initializing chain store
                });
        })
        .catch(err => {
            // error connecting to DCore daemon ws interface
        });
```

#### Private keys

As a example, here's how to generate a new private key from a seed (a brainkey for example):

```javascript
    var {PrivateKey, key} = require("dcorejs-lib");
    
    let seed = "THIS IS A TERRIBLE BRAINKEY SEED WORD SEQUENCE";
    let pkey = PrivateKey.fromSeed( key.normalize_brainKey(seed) );
    
    console.log("\nPrivate key:", pkey.toWif());
    console.log("Public key :", pkey.toPublicKey().toString(), "\n");
```

#### Transactions

```javascript
    var {Apis, TransactionHelper, ChainStore, FetchChain, Aes, TransactionBuilder} = require('dcorejs-lib');

    var amount = 0.11;
    var fromAccountId = 'sender_account_name';
    var toAccountId = 'receiver_account_name';
    var memoMessage = 'some memo for receiver';
    
    Apis.instance().init_promise
        .then(res => {
            ChainStore.init()
                .then(() => {
                   Promise.all([
                       FetchChain('getAccount', fromAccountId),
                       FetchChain('getAccount', toAccountId),
                       FetchChain('getAsset', 'DCT'),
                   ])
                   .then(result => {
                       var [fromAccount, toAccount, amountAsset] = result;
                       
                       var privateKey = fromAccount.get('owner').get('key_auths').get(0).get(0);
                       var senderMemoKey = fromAccount.get('options').get('memo_key');
                       var receiverMemoKey = toAccount.get('options').get('memo_key');
                       var nonce = TransactionHelper.unique_nonce_uint64();
                       
                       var memo = {
                           from: senderMemoKey,
                           to: receiverMemoKey,
                           nonce: nonce,
                           message: Aes.encrypt_with_checksum(privateKey, receiverMemoKey, nonce, memoMessage),
                       };
                       
                       var tb = new TransactionBuilder();
                       tb.add_type_operation('transfer', {
                           fee: {
                               amount: 0,
                               asset_id: amountAsset.get('id')
                           },
                           from: fromAccount.get('id'),
                           to: toAccount.get('id'),
                           amount: {
                               amount: amount, 
                               asset_id: amountAsset.get('id')
                           },
                           memo: memo
                       });
                       tb.set_required_fees()
                        .then(() => {
                            tr.add_signer(privateKey, privateKey.toPublicKey().toPublicKeyString());
                            tr.broadcast()
                                .then(() => {
                                    // transaction successfully broadcasted to DCore network
                                })
                                .catch(err => {
                                    // error broadcasting transaction
                                });
                        })
                        .catch(err => {
                            // error setting transaction fees
                        });
                   });
                });
        })
        .catch(err => {
            // error connecting to DCore daemon ws interface
        });
```
