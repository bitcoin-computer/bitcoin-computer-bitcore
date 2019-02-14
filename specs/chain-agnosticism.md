
# Making Bitcoin Source Chain Agnostic
Currently, Bitcoin Token uses the following classes from Bitcoin Source:  

Address, PublicKey, PrivateKey, HDPrivateKey, Mnemonic  
Signature, Script, Opcode, Transaction, Output, Input, MultiSigScriptHash, PublicKeyHashInput, MultiSigScriptHashInput  

# Goal
Our goal is to make Bitcoin Token work on different chains. To make that possible, we want to turn Bitcoin Source into a minimal library that can do the following:



|  Task                               | Priority | BCH | BSV | BTC  |
|-------------------------------------|----------|-----|-----|------|
|Build and sign p2pkh tx              | high     | ?   | ?   | ?    |
|Build and sign p2sh tx               | high     | ?   | ?   | ?    |
|Compute tx id                        | high     | ?   | ?   | ?    |
|Create addresses from keys           | high     | ?   | ?   | ?    |
|Create keys from mnemonics           | high     | ?   | ?   | ?    |
|Derive keys from other HD keys       | high     | ?   | ?   | ?    |
|Test transaction fromHex and toHex   | high     | ?   | ?   | ?    |
|Tests to broadcast tx on regtest net | medium   | ?   | ?   | ?    |
|Test block fromHex and toHex         | medium   | ?   | ?   | ?    |
|Test merkleblock fromHex and toHex   | medium   | ?   | ?   | ?    |

# Research

| Task                                                           | Priority | BCH             | BSV                             | BTC                    |
|----------------------------------------------------------------|----------|-----------------|----------------------------------|-----------------------|
|Research script opcode differences (op_datasigverify, …)        |          |Monolithic + DSV | Monolithic + MUL+L/RSHIFT+INVERT | None Re-enabled |
|Research transaction format differences                         |          |                 |          | SegWit   |
|Chained Transaction Limit                                       |          |25               | 25       | 25       |
|OP_RETURN size                                                  |          |223+ (large OR mined)| 100,000 | 80    |
|Max non-push operations per script (MAX_OPS_PER_SCRIPT)         |          |201              | 500        | 201    |
|Research differences in p2p protocol (network magic, …)         |          |?                | ?        | ?        |
|Research address differences                                    |          |CashAddr         | Original | Original |
|Research block format differences                               |          |CTOR             | TTOR     | TTOR     |
|Research if there are other differences                         |          |?                | ?        | ?        |

