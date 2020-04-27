let fs = require('fs');
let solc = require('solc');
let Web3 = require('web3');

let contract = compileContract();

let web3 = createWeb3();
let sender = '0x00f048b105507eef6f805c8377919b5edb47f2d7';

deployContract(web3, contract, sender)
  .then(() => {
    console.log('Deployment finish');
  })
  .catch(err => {
    console.log(`Failed to deploy contract: ${err}`);
  });

function compileContract() {
  var input = {
    language: 'Solidity',
    sources: {
      MultiSigWallet: {
        content: fs.readFileSync('./contracts/MultiSigWallet.sol', 'utf8')
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

  let conpiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
  let contract = conpiledContract.contracts['MultiSigWallet']['MultiSigWallet'];
  //   console.log(conpiledContract.contracts['MultiSigWallet'].MultiSigWallet);

  let abi = contract.abi;

  fs.writeFileSync('abi.json', JSON.stringify(abi));
  return contract;
}
function createWeb3() {
  let web3 = new Web3('http://127.0.0.1:8545');
  //   web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8545'));
  return web3;
}

async function deployContract(web3, contract, sender) {
  let MultiSigWallet = new web3.eth.Contract(contract.abi);
  let bytecode = '0x' + contract.evm.bytecode.object;
  let gasEstimate = await web3.eth.estimateGas({ data: bytecode, nonce: 3000 });

  console.log('Deploying the contract');
  const contractInstance = await MultiSigWallet.deploy({
    data: bytecode,
    arguments: [
      [
        '0xca35b7d915458ef540ade6068dfe2f44e8fa733c',
        '0x14723a09acff6d2a60dcdf7aa4aff308fddc160c'
      ],
      '2',
      '0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db'
    ]
  })
    .send({
      from: sender,
      gas: gasEstimate
    })
    .on('transactionHash', transactionHash => {
      console.log(`Transaction hash: ${transactionHash}`);
    })
    .on('confirmation', (confirmationNumber, receipt) => {
      console.log(`Confimation number: ${confirmationNumber}`);
    });

  console.log(`Contract address: ${contractInstance.options.address}`);
}
