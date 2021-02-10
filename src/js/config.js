module.exports={
  RSAProperties : {
    modulus: 1024,
    exponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: {name: "SHA-256"},
    isExtractable: true
  },

  PBKDF2Properties : {
    iterations: 100000,
    algorithm: {
      name: "AES-GCM",
      length: 256
    },
    hash: {name: "SHA-256"},
    isExtractable: false
  },

  AESProperties : {
    tagLength: 128
  }
};
