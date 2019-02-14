
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

| Task                                                           | Priority | BCH             | BSV | BTC  |
|----------------------------------------------------------------|----------|-----------------|-----|------|
|Research script opcode differences (op_datasigverify, …)        |          |Monolithic + DSV | ?   | ?    |
|Research transaction format differences (ie. SegWit)            |          |?                | ?   | ?    |
|Research size differences (op_return size, sigop/ops limit, ...)|          |?                | ?   | ?    |
|Research differences in p2p protocol (network magic, …)         |          |?                | ?   | ?    |
|Research address differences (cashaddr, …)                      |          |?                | ?   | ?    |
|Research block format differences (ctor, ttor)                  |          |?                | ?   | ?    |
|Research if there are other differences                         |          |?                | ?   | ?    |

