# dcorejs-lib

> This library is combined forks of [graphenejs-lib](https://github.com/svk31/graphenejs-lib) 
and [graphenejs-ws](https://github.com/svk31/graphenejs-ws). 

The library was created as a combination of forks of graphenejs-lib and graphenejs-ws with necessary corrections.
Can be used to construct, sign and broadcast transactions in JavaScript, and to easily obtain data from the blockchain 
via public APIs.

[![npm version](https://img.shields.io/npm/v/graphenejs-lib.svg?style=flat-square)](https://www.npmjs.com/package/dcorejs-lib)
[![npm downloads](https://img.shields.io/npm/dm/graphenejs-lib.svg?style=flat-square)](https://www.npmjs.com/package/graphenejs-lib)

## Setup

To obtain the library use npm:
```
npm install dcorejs-lib
```

## Usage

The following examples will provide you basics of dcorejs-lib library usage, like is manipulation and doing fetches of 
DCore blockchain objects.

### Initialization

Moreover, it includes connection to DCore daemon APIs.

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

The module provides utility methods which handles DCore blockchain objects.

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

Generate a new private key from a seed (e.g. a brainkey).

```javascript
    var {PrivateKey, key} = require("dcorejs-lib");
    
    let seed = "THIS IS A TERRIBLE BRAINKEY SEED WORD SEQUENCE";
    let pkey = PrivateKey.fromSeed( key.normalize_brainKey(seed) );
    
    console.log("\nPrivate key:", pkey.toWif());
    console.log("Public key :", pkey.toPublicKey().toString(), "\n");
```

#### Transactions

Following example show the way of broadcasting `transfer` operation transaction into DCore network. 

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
