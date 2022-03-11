const ElectrumClient = require("@codewarriorr/electrum-client-js");

//Electrum Ravencoin docs
//https://electrumx-ravencoin.readthedocs.io/en/latest/protocol.html

async function main() {
  const client = new ElectrumClient("rvn4lyfe.com", 50002, "ssl");

  try {
    await client.connect(
      "electrum-client-js", // optional client name
      "1.9" // optional protocol version
    );

    const header = await client.blockchain_headers_subscribe();
    console.log("Current header:", header);

    const features = await client.server_features();
    console.log("Features:", features);

    //A burn address
    const address = "RXissueAssetXXXXXXXXXXXXXXXXXhhZGt";
    const balance = await client.blockchain_scripthash_getBalance(
      getScriptHashFromRavencoinAddress(address)
    );
    console.log(
      "RVN balance for address",
      address,
      (balance.confirmed / 100000000).toLocaleString()
    );

    const assetBalances = await client.request(
      "blockchain.scripthash.get_asset_balance",
      [getScriptHashFromRavencoinAddress(address)]
    );
    console.log("Assets balance for", address, assetBalances);

    //TODO how to get the script hash?

    const RAVENREBELS = await client.request("blockchain.asset.get_meta", [
      "RAVENREBELS",
    ]);

    console.log("RAVENREBELS", RAVENREBELS);

    await client.close();
  } catch (err) {
    console.error(err);
  }
}

main();

function getScriptHashFromRavencoinAddress(address) {
  const bitcoin = require("bitcoinjs-lib");
  const coininfo = require("coininfo"); //coininfo gives us meta data about a bunch of crypto currencies, including Ravencoin

  const frmt = coininfo.ravencoin.main.toBitcoinJS();

  const RAVENCOIN_NETWORK = {
    messagePrefix: "\x16Raven Signed Message:\n",
    bip32: {
      public: frmt.bip32.public,
      private: frmt.bip32.private,
    },
    pubKeyHash: frmt.pubKeyHash,
    scriptHash: frmt.scriptHash,
    wif: frmt.wif,
  };

  let script = bitcoin.address.toOutputScript(address, RAVENCOIN_NETWORK);
  let hash = bitcoin.crypto.sha256(script);
  let reversedHash = Buffer.from(hash.reverse());
  return reversedHash.toString("hex");
}
