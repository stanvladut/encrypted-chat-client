/* Enums ================================== */
var keyType = {
    private: "pkcs8",
    public: "spki",
    raw: "raw"
};

var keyUse = {
    sign: ["sign"],
    verify: ["verify"],
    encrypt: ["encrypt"],
    decrypt: ["decrypt"],
    encrypt_decrypt: ["encrypt", "decrypt"],
    deriveKey: ["deriveKey"],
    deriveBits: ["deriveBits"],
    deriveKey_Bits: ["deriveKey", "deriveBits"]
};

var hash = {
    SHA1: "SHA-1",
    SHA256: "SHA-256",
    SHA384: "SHA-384",
    SHA512: "SHA-512"
};
/* END Enums ================================== */




/* String <-> ArrayBuffer converters ========= */
function ArrayBufferToStr(buffer) {
    var result_string = '';
    var view = new Uint8Array(buffer);

    for(var i = 0; i < view.length; i++)
        result_string = result_string + String.fromCharCode(view[i]);

    return result_string;
};

function StringToArrayBuffer(string) {
  var buf = new ArrayBuffer(string.length);
  var bufView = new Uint8Array(buf);
    
  for (var i=0, strLen=string.length; i < strLen; i++) {
    bufView[i] = string.charCodeAt(i);
  }
    
  return buf;
};

function serializeData(data) {
    return JSON.stringify(data);
};

function deserializeData(string) {
    return JSON.parse(string);
};

function arrayBufferToBase64String(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';

    for (var i=0; i<byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }

    return btoa(byteString);
};

function base64ToArrayBuffer(base64Str) {
    var raw = atob(base64Str);
    var arrayBuff = new Uint8Array(new ArrayBuffer(raw.length));
    for(var i = 0; i < raw.length; ++i) {
        arrayBuff[i] = raw.charCodeAt(i);
    }
    return arrayBuff;
};

function convertPEMKeyToArrayBuffer(pemKey) {
    var raw = atob(pemKey);
    var arrayBuff = new Uint8Array(new ArrayBuffer(raw.length));
    for(var i = 0; i < raw.length; ++i) {
        arrayBuff[i] = raw.charCodeAt(i);
    }
    return arrayBuff;
};

function convertBinaryToPem(binaryData) {
    var base64PublicKey = arrayBufferToBase64String(binaryData);

    //var pemPublicKey = "-----BEGIN " + label + "-----\r\n";
    var pemPublicKey = "";

    var nextIndex = 0;
    while (nextIndex < base64PublicKey.length) {
        if (nextIndex + 64 <= base64PublicKey.length) {
            pemPublicKey += base64PublicKey.substr(nextIndex, 64) + "\r\n";
        } else {
            pemPublicKey += base64PublicKey.substr(nextIndex) + "\r\n";
        }
        nextIndex += 64;
    }

    //pemPublicKey += "-----END " + label + "-----\r\n";
    return pemPublicKey;
};
/* END String <-> ArrayBuffer converters ========= */



/* Generic WebCrypto API ============= */

/* Key methods =============== */
var exportKey = function(params){
    if (!params) {
        return Promise.reject("No params to export key!");
    }
    
    if (!(params.key && params.type && params.key instanceof CryptoKey)) {
        return Promise.reject("Some of the required params to export key doesn't exist");
    }
    
    return window.crypto.subtle.exportKey(
        params.type,
        params.key
    );
};

var importKey = function (params) {
    if (!params) {
        return Promise.reject("No params to import key!");
    }
    
    if (!(params.type && params.key && params.algorithm && params.usedFor)) {
        return Promise.reject("Some of the required params to import key doesn't exist");
    }
    
    return window.crypto.subtle.importKey(
        params.type,
        params.key,
        params.algorithm,
        params.isExtractable || false,
        params.usedFor
    );
};

var wrapKey = function (params) {
    if (!params) {
        return Promise.reject("No params to wrap key!");
    }
    
    if (!(params.type && params.key && params.algorithm && params.publicKey)) {
        return Promise.reject("Some of the required params to import key doesn't exist");
    }
    
    return window.crypto.subtle.wrapKey(
        params.type,
        params.key,
        params.publicKey,
        params.algorithm
    );
};

var generateKey = function (params) {
    if (!(params && params.algorithm)) {
        return Promise.reject("No params to generate key!");
    }
    
    return window.crypto.subtle.generateKey(
        params.algorithm,
        params.isExtractable || false,
        params.usedFor || ["encrypt", "decrypt"]
    );
};

var deriveKey = function (params) {
    if (!(params && params.method)) {
        return Promise.reject("No params to derive key!");
    }
    
    if (!(params.key && params.key instanceof CryptoKey)) {
        return Promise.reject("Some of the required params to derive key doesn't exist");
    }
    
    return window.crypto.subtle.deriveKey(
        params.method,
        params.key,
        params.algorithm,
        params.isExtractable || false,
        params.usedFor || ["encrypt", "decrypt"]
    );
};
/* END Key methods =============== */

/* Encrypt/Decrypt methods =========== */
var encrypt = function (params) {
    if (!params) {
      return Promise.reject("No params to AES encrypt!");
    }
    
    if (!(params.key && params.key instanceof CryptoKey)) {
        return Promise.reject("key to encrypt fails");
    }
    
    if (!(params.data && params.algorithm)) {
        return Promise.reject("Some of the required params to encrypt doesn't exist");
    }
    
    return window.crypto.subtle.encrypt(
        params.algorithm, 
        params.key, 
        params.data
    );  
};

var decrypt = function (params) {
    if (!params) {
      return Promise.reject("No params to AES decrypt!");
    }
    
    if (!(params.key && params.key instanceof CryptoKey)) {
        return Promise.reject("key to decrypt fails");
    }
    
    if (!(params.data && params.algorithm)) {
        return Promise.reject("Some of the required params to decrypt doesn't exist");
    }
    
    return window.crypto.subtle.decrypt(
        params.algorithm,
        params.key,
        params.data
    ); 
};
/* END Encrypt/Decrypt methods =========== */

/* Sign/Verify methods =================== */
var sign = function(params) {
    if (!params) {
        return Promise.reject("No params to sign!");
    }

    if (!(params.key && params.algorithm && params.data)) {
        return Promise.reject("Some of the required params to sign doesn't exist");
    }
   
    return window.crypto.subtle.sign(
        params.algorithm,
        params.key,
        params.data
    );  
};

var verify = function(params) {
     if (!params) {
        return Promise.reject("No params to verify!");
    }

    if (!(params.key && params.algorithm && params.data && params.signature)) {
        return Promise.reject("Some of the required params to verify doesn't exist");
    }
    
    return window.crypto.subtle.verify(
        params.algorithm,
        params.key, //from generateKey or importKey above
        params.signature, //ArrayBuffer of the signature
        params.data //ArrayBuffer of the data
    );
};
/* END Sign/Verify methods =================== */

/* Digest ==============================*/
var sha = function(params) {
    if (!params) {
        return Promise.reject("No params to digest!");
    }

    if (!(params.data)) {
        return Promise.reject("Some of the required params to digest doesn't exist");
    }
    
    return window.crypto.subtle.digest(
        {
            name: params.algorithm || hash.SHA256
        },
        params.data
    );
};
/* END Digest ==============================*/

/* Random Values ========================= */
var generateRandomBytes = function (bytes) {
    if (!bytes) {
        return Promise.reject("No value for generating random bytes!");
    }
    
    return window.crypto.getRandomValues(new Uint8Array(bytes));
};
/* END Random Values ========================= */

/* END Generic WebCrypto API ============= */



/* Utilities ============ */
/* PBKDF2 ============== */
var PBKDF2_importKey = function(params) {
    if (!params.key) {
        return Promise.reject("No params to PBKDF2 import key!");
    }
    
    return importKey({
        type: keyType.raw,
        key: params.key,
        algorithm: {
            name: "PBKDF2"
        },
        isExtractable: params.isExtractable || false,
        usedFor: params.usedFor || keyUse.deriveKey_Bits
    });
};

var PBKDF2_deriveKey = function(params) {
    if (!params) {
        return Promise.reject("No params to PBKDF2 derive key!");
    }
    
    if (!(params.salt && params.iterations && params.algorithm)) {
        return Promise.reject("Some of the required params to PBKDF2 derive key doesn't exist");
    }
    
    if (!(params.key && params.key instanceof CryptoKey)) {
        return Promise.reject("PBKDF2 key fails");
    }
    
    return deriveKey({
        method: {
            "name": "PBKDF2",
            salt: params.salt,
            iterations: params.iterations,
            hash: params.hash || {name: hash.SHA256}
        },
        key: params.key,
        algorithm: params.algorithm,
        isExtractable: params.isExtractable || false,
        usedFor: params.usedFor || keyUse.encrypt_decrypt
    });
};
/* END PBKDF2 ============== */

/* RSA ==================== */
var RSA_generateKey = function (params) {
    if (!params) {
        return Promise.reject("No params to RSA generate key!");
    }

    if (!(params.modulus && params.exponent)) {
        return Promise.reject("Some of the required params to RSA generate key doesn't exist");
    }

    return generateKey({
        algorithm: {
            name: "RSA-OAEP",
            modulusLength: params.modulus,
            publicExponent: params.exponent,
            hash: params.hash || {name: hash.SHA256}
        },
        isExtractable: params.isExtractable || false
    });
};

var RSA_sign = function(params) {
    if (!params) {
        return Promise.reject("No params for RSA signature!");
    }

    if (!(params.key && params.data)) {
        return Promise.reject("Some of the required params for RSA signature doesn't exist");
    }
    
    return sign({
        algorithm: {
            name: "RSA-PSS",
            saltLength: 10
        },
        key: params.key,
        data: params.data
    });
};

var RSA_verify = function(params) {
    if (!params) {
        return Promise.reject("No params for RSA verify!");
    }

    if (!(params.key && params.data && params.signature)) {
        return Promise.reject("Some of the required params for RSA verify doesn't exist");
    }

    return verify({
        algorithm: {
            name: "RSA-PSS",
            saltLength: 10
        },
        key: params.key,
        signature: params.signature,
        data: params.data
    });
};

var RSA_encrypt = function(params) {
    if (!params) {
        return Promise.reject("No params for RSA encryption!");
    }

    if (!(params.key && params.data)) {
        return Promise.reject("Some of the required params for RSA encryption doesn't exist");
    } 
    
    return encrypt({
        algorithm: {
            name: "RSA-OAEP"
        },
        key: params.key,
        data: params.data
    });
};

var RSA_decrypt = function(params) {
    if (!params) {
        return Promise.reject("No params for RSA decryption!");
    }

    if (!(params.key && params.data)) {
        return Promise.reject("Some of the required params for RSA decryption doesn't exist");
    } 
    
    return decrypt({
        algorithm: {
            name: "RSA-OAEP"
        },
        key: params.key,
        data: params.data
    });
};
    
var RSA_importKey = function(params) {
    if (!params) {
        return Promise.reject("No params for RSA import key!");
    }

    if (!(params.key && params.usedFor && params.type)) {
        return Promise.reject("Some of the required params for RSA import key doesn't exist");
    }
    
    var algorithm = {
        hash: {
            name: hash.SHA256
        }
    };
    
    switch (params.usedFor) {
        case keyUse.encrypt_decrypt:
        case keyUse.encrypt:
        case keyUse.decrypt:
            algorithm.name = "RSA-OAEP";
            break;
        
        case keyUse.sign:
        case keyUse.verify:
            algorithm.name = "RSA-PSS";
            break;
    }
    
    return importKey({
        type: params.type,
        key: params.key,
        algorithm: algorithm,
        isExtractable: params.isExtractable ? params.isExtractable : false,
        usedFor: params.usedFor
    });
}; 

var RSA_importAndEncrypt = function (params) {
    if (!params) {
        return Promise.reject("No params for RSA import and encrypt!");
    }

    if (!(params.key && params.data)) {
        return Promise.reject("Some of the required params for RSA import and encrypt doesn't exist");
    }
    
    return RSA_importKey({
        type: keyType.public,
        key: params.key,
        usedFor: keyUse.encrypt
    })
    .then(function(importedKey){
        return RSA_encrypt({
            data: params.data,
            key: importedKey
        });
    });
};

var RSA_importAndDecrypt = function (params) {
    if (!params) {
        return Promise.reject("No params for RSA import and decrypt!");
    }

    if (!(params.key && params.data)) {
        return Promise.reject("Some of the required params for RSA import and decrypt doesn't exist");
    }
    
    return RSA_importKey({
        type: keyType.private,
        key: params.key,
        usedFor: keyUse.decrypt
    })
    .then(function(importedKey){
        return RSA_decrypt({
            data: params.data,
            key: importedKey
        });
    });
};
/* END RSA ==================== */

/* AES ==================== */
var AES_encrypt = function (params) {
    if (!params) {
        return Promise.reject("No params to AES encrypt!");
    }
    
    if (!(params.key && params.data && params.iv && params.additionalData && params.tagLength)) {
        return Promise.reject("Some of the required params to AES encrypt doesn't exist");
    }
    
    return encrypt({
        algorithm: {
            name: "AES-GCM",
            iv: params.iv,
            additionalData: StringToArrayBuffer(params.additionalData),
            tagLength: params.tagLength,
        }, 
        key: params.key, 
        data: params.data
    });
};

var AES_decrypt = function (params) {
    if (!params) {
        return Promise.reject("No params to AES decrypt!");
    }
    
    if (!(params.key && params.data && params.iv && params.additionalData && params.tagLength)) {
        return Promise.reject("Some of the required params to AES decrypt doesn't exist");
    }
    
    return decrypt({
        algorithm: {
            name: "AES-GCM",
            iv: params.iv,
            additionalData: StringToArrayBuffer(params.additionalData),
            tagLength: params.tagLength
        }, 
        key: params.key, 
        data: params.data
    });
};

var AES_generateKey = function (params) {
    return generateKey({
        algorithm: {
            name: "AES-GCM",
            length: params ? (params.length ? params.length : 256) : 256,
        },
        isExtractable: params ? (params.isExtractable ? params.isExtractable : false) : false
    });
};

var AES_importKey = function(params) {
   if (!params.key) {
        return Promise.reject("No params to AES import key!");
    }
    
    return importKey({
        type: keyType.raw,
        key: params.key,
        algorithm: {
            name: "AES-GCM"
        },
        isExtractable: params.isExtractable || false,
        usedFor: params.usedFor || keyUse.encrypt_decrypt
    });
};
/* END AES ==================== */
/* END Utilities ============ */



/* MIXIN functions ============== */
var generateMasterPasswordDerivedKey = function(params) {
    if (!params) {
        return Promise.reject("No params to generate master password derivate key!");
    }
    
    if (!(params.salt && params.algorithm && params.iterations && params.masterPassword)) {
        return Promise.reject("Some of the required params to generate master password derivate key doesn't exist");
    }
    
    return PBKDF2_importKey({
            key: StringToArrayBuffer(params.masterPassword)
        })
        .then(function(importedKey){
            return PBKDF2_deriveKey({
                key: importedKey,
                salt: params.salt,
                iterations: params.iterations,
                algorithm: params.algorithm,
                hash: params.hash ? params.hash : {name: hash.SHA256},
                isExtractable: params.isExtractable ? params.isExtractable : false
            });
        });
};

var generateResourceSignature = function(params) {
    if (!params) {
        return Promise.reject("No params to create the resource signature!");
    }
    
    if (!(params.data && params.key)) {
        return Promise.reject("Some of the required params to create the resource doesn't exist");
    }
    
    return sha({
        algorithm: hash.SHA256,
        data: params.data
    })
    .then(function(hash){
        return RSA_importKey({
            type: keyType.private,
            usedFor: keyUse.sign,
            key: params.key
        })
        .then(function(importedKey){
            return RSA_sign({
                key: importedKey,
                data: hash
            });
        });
    })
};

var verifyResourceSignature = function(params) {
    if (!params) {
        return Promise.reject("No params to create the resource signature!");
    }
    
    if (!(params.data && params.key && params.signature)) {
        return Promise.reject("Some of the required params to create the resource doesn't exist");
    }
    
    return sha({
        algorithm: hash.SHA256,
        data: params.data
    })
    .then(function(hash){
        return RSA_importKey({
            type: keyType.public,
            usedFor: keyUse.verify,
            key: params.key
        })
        .then(function(importedKey){
            return RSA_verify({
                key: importedKey,
                signature: params.signature,
                data: hash
            });
        });
    });
};
/* END MIXIN functions ============== */

/* PUBLIC API ====================== */
var createNewEnvironment = function(RSAProperties, PBKDF2Properties, AESProperties){
    return new Promise(function(rezolve, reject) {
        RSA_generateKey(RSAProperties)
            .then(function(RSAKeyPair){
                exportKey({
                    key: RSAKeyPair.privateKey,
                    type: keyType.private     
                })
                .then(function(RSAPrivateKey){
                    var salt = generateRandomBytes(32);
                    PBKDF2Properties.salt = salt;
                    generateMasterPasswordDerivedKey(PBKDF2Properties)
                        .then(function(MasterPasswordKey){
                            var iv = generateRandomBytes(12); 
                            AESProperties.iv = iv;
                            AESProperties.data = RSAPrivateKey;
                            AESProperties.key = MasterPasswordKey;
                            AES_encrypt(AESProperties)
                                .then(function(encryptedRSAprivateKey){
                                    exportKey({
                                        type: keyType.public,
                                        key: RSAKeyPair.publicKey
                                    })
                                    .then(function(exportedRSAPublicKey){
                                        rezolve({
                                            publicKey: arrayBufferToBase64String(exportedRSAPublicKey),
                                            encryptedPrivateKey: arrayBufferToBase64String(encryptedRSAprivateKey),
                                            salt: arrayBufferToBase64String(salt),
                                            iv: arrayBufferToBase64String(iv)
                                        });
                                    });
                                });
                        });
                });
            })
            .catch(function(err){
                reject(err);
            });
    });
};

var setEnvironment = function (PBKDF2Properties, AESProperties) {
    return new Promise(function(resolve, reject) {
        PBKDF2Properties.salt = base64ToArrayBuffer(PBKDF2Properties.salt);
        generateMasterPasswordDerivedKey(PBKDF2Properties)
            .then(function(MasterPasswordKey){
                AESProperties.key = MasterPasswordKey;
                AESProperties.data = base64ToArrayBuffer(AESProperties.data);
                AESProperties.iv = base64ToArrayBuffer(AESProperties.iv);
                AES_decrypt(AESProperties)
                    .then(function(decryptedRSAPrivateKey){
                        resolve({
                            decryptedRSAPrivateKey: arrayBufferToBase64String(decryptedRSAPrivateKey)
                        });
                    });
            })
            .catch(function(err){
                reject(err);
            });
    });
};

var encryptResources = function(resources, interlocutorKey, privateKey, publicKey) {
    return new Promise(function(resolve, reject) { 
        AES_generateKey({
                length: 256,
                isExtractable: true
        })
        .then(function(AESPrivateKey){
            var iv = generateRandomBytes(12),
                signatureData = serializeData({
                    data: resources.data,
                    userID: resources.userID
                });
            generateResourceSignature({
                data: StringToArrayBuffer(signatureData),
                key: base64ToArrayBuffer(privateKey)
            })
            .then(function(resourceSignature) {
                var messageToEncrypt = serializeData({
                    data: resources.data,
                    userID: resources.userID,
                    signature: ArrayBufferToStr(resourceSignature)
                });
                AES_encrypt({
                    key: AESPrivateKey,
                    iv: iv,
                    additionalData: resources.userID,
                    tagLength: 128,
                    data: StringToArrayBuffer(messageToEncrypt)
                })
                .then(function(cipherText){
                    exportKey({
                        type: keyType.raw,
                        key: AESPrivateKey
                    })
                    .then(function(exportedAESPrivateKey){
                        RSA_importAndEncrypt({
                            key: base64ToArrayBuffer(interlocutorKey),
                            data: exportedAESPrivateKey
                        })
                        .then(function(encryptedAESKeyInterlocutor){
                            RSA_importAndEncrypt({
                                data: exportedAESPrivateKey,
                                key: base64ToArrayBuffer(publicKey)
                            })
                            .then(function(encryptedAESKeyMe){
                                resolve({
                                    type: resources.type,
                                    cipherText: arrayBufferToBase64String(cipherText),
                                    iv: arrayBufferToBase64String(iv),
                                    tagLength: 128,
                                    symmetricKeyForInterlocutor: arrayBufferToBase64String(encryptedAESKeyInterlocutor),
                                    symmetricKeyForMe: arrayBufferToBase64String(encryptedAESKeyMe)
                                });
                            });
                        });
                    });
                });
            });
        })
        .catch(function(err){
            reject(err);
        });    
    });
};

var decryptResources = function(resources, interlocutorKey, interlocutorID, privateKey) {
    return new Promise(function(resolve, reject) {
        RSA_importAndDecrypt({
            key: base64ToArrayBuffer(privateKey),
            data: base64ToArrayBuffer(resources.key)
        })
        .then(function(rawAESPrivateKey){
            AES_importKey({
               key: rawAESPrivateKey,
               usedFor: keyUse.decrypt
            })
            .then(function(AESPrivateKey){
                AES_decrypt({
                    data: base64ToArrayBuffer(resources.cipherText),
                    iv: base64ToArrayBuffer(resources.iv),
                    tagLength: resources.tagLength,
                    key: AESPrivateKey,
                    additionalData: interlocutorID
                })
                .then(function(decryptedContent){
                    var deserializedResource = deserializeData(ArrayBufferToStr(decryptedContent));
                    verifyResourceSignature({
                        data: StringToArrayBuffer(serializeData({
                            data: deserializedResource.data,
                            userID: deserializedResource.userID
                        })),
                        key: base64ToArrayBuffer(interlocutorKey),
                        signature: StringToArrayBuffer(deserializedResource.signature)
                    })
                    .then(function(isValid){
                        if (isValid) {
                            resolve(deserializedResource.data);
                        } else {
                            reject("Semnatura nevalida!");
                        }
                    });  
                });
            }); 
       })
       .catch(function(err){
            reject(err);
        }); 
    });
};

var changeMasterPassword = function(PBKDF2Properties, AESProperties, newMasterPassword) {
    return new Promise(function(resolve, reject) {
        setEnvironment(PBKDF2Properties, AESProperties)
        .then(function(environment){
            PBKDF2Properties.masterPassword = newMasterPassword;
            generateMasterPasswordDerivedKey(PBKDF2Properties)
            .then(function(newMasterPasswordDerivedKey){
                AESProperties.key = newMasterPasswordDerivedKey;
                AESProperties.data = base64ToArrayBuffer(environment.decryptedRSAPrivateKey);
                AES_encrypt(AESProperties)
                .then(function(newEncryptedRSAPrivateKey){
                    resolve({
                       newKey: arrayBufferToBase64String(newEncryptedRSAPrivateKey)
                    });
                });
            });
        })
        .catch(function(err){
            reject(err);
        })
    });
};
/* END PUBLIC API ====================== */