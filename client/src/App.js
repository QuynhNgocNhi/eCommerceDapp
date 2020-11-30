import React, { useState, useEffect } from "react";
import { Box, Form, Input, Select, Field, Button, Text, Checkbox, Radio, Flex, Card, Icon, MetaMaskButton, Image, Heading, Table } from "rimble-ui";
// import { useWeb3Context } from 'web3-react'
import logo from './logo.png';
import './App.css';
import Web3 from "web3";
import getWeb3 from "./getWeb3";
import MarketplaceContract from "./contracts/Marketplace.json";
import { MarketplaceDeployed } from "./abi/MarketplaceDeployed.js";
import { SupplyChainDeployed } from "./abi/SupplyChainDeployed.js";

function App() {
  // const [state, setstate] = useState(initialState)
  const [count, setCount] = useState(0);
  const [index, setIndex] = useState(0);
  const [lastProductsObj, setlastProductsObj] = useState([]);
  const [productsIndexed, setproductsIndexed] = useState([]);
  const [inputName, setInputName] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [inputId, setInputId] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [web3, setWeb3] = useState(undefined);
  const [contractMarketplace, setContractMarketplace] = useState("");
  const [accounts, setAccounts] = useState([]);

  // Comment option 1 or 2, then set corresponding address
  useEffect(() => {
    const init = async () => {
      try {
        // To Do: Create condition between options
        // Variable populated with Web3.givenProvider
        // Condition check:
          // If networkVersion 5, code option 2 below
          // If networkVersion 5777, option 2 with updated variables
          // Else, error

          // Option 1: Ganache
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the Marketplace contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = MarketplaceContract.networks[networkId];
        const instanceMarketplace = new web3.eth.Contract(
          MarketplaceContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        // Option 2: Görli
        // Get the deployed Marketplace contract
        /* const web3 = new Web3(Web3.givenProvider);
        console.log(Web3.givenProvider)
        // Address of deployed SupplyChain (change deplyedContract + functions)
        // const contractAddress = "0xA05De8c36234Fb74a0FD6f216a3568dbBe5400Eb";
        // Address of new contract
        const contractAddress = "0x245387e1E7210A367886b24e0D814D4df4961005";
        const deployedContract = new web3.eth.Contract(MarketplaceDeployed, contractAddress);

        const accounts = await web3.eth.getAccounts();
 */
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.

        // Init state
        const count = await instanceMarketplace/* deployedContract */.methods.getCount().call();

        setWeb3(web3);
        setAccounts(accounts);
        setContractMarketplace(instanceMarketplace/* deployedContract */);
        setCount(count);

      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }
    init();
  }, []);


  const addItem = async (t) => {
    t.preventDefault();
    const account = accounts[0];
    const contract = contractMarketplace;

    const productsObj = {
      MacBookPro: Web3.utils.toWei('2', 'ether'),
      iPad: Web3.utils.toWei('1', 'ether'),
      PlayStation: Web3.utils.toWei('2', 'ether'),
      Sonos: Web3.utils.toWei('3', 'ether')
    }

    const productName = Object.keys(productsObj)[Math.floor(Math.random() * Object.keys(productsObj).length)];
    const productPrice = productsObj[productName];

    await contract.methods.addProduct(productName, productPrice).send({from: account});
    // Alternative with gas estimate
    // const gas = await contract.methods.addProduct(productName, productPrice).estimateGas();
    // const post = await contract.methods.addProduct(productName, productPrice).send({
    //   from: account,
    //   gas,
    // });
  };


  const showProducts = async (t) => {
    t.preventDefault();
    const contract = contractMarketplace;
    const numProducts = await contract.methods.getCount().call();
    // Anzahl Produkte die angezeigt wurden von numProducts abziehen
    const numShown = 6;
    let index = 0;

    for (let i = numProducts - 1; i > numProducts - numShown; i--) {
      const post = await contract.methods.fetchProduct(i).call()
      setlastProductsObj((prevState => [...prevState, post]));
      index ++
      productsIndexed.push({index: index, id: post.id, name: post.name, price: post.price})
      // Push post to array
    }
  }

  const handleSubmitAddItem = e => {
    alert('A product was added: ' + inputName + inputPrice);

    e.preventDefault();
    const account = accounts[0]
    const contract = contractMarketplace;
    const productName = inputName;
    const productPrice = Web3.utils.toWei(inputPrice, 'ether');

    contract.methods.addProduct(productName, productPrice).send({ from: account });
    // Alternative with gas estimate
    // const gas = await contract.methods.addProduct(productName, productPrice).estimateGas();
    // const post = await contract.methods.addProduct(productName, productPrice).send({
    //   from: account,
    //   gas,
    // });

  }

  const handleSubmitBuyItem = e => {
    alert('Id of product to be purchased: ' + inputId);
    e.preventDefault();
    const account = accounts[0]
    const contract = contractMarketplace;

    const productId = inputId;
    const amount = Web3.utils.toWei(inputAmount, 'ether');

    contract.methods.buyProduct(productId).send({ from: account, value: amount })
  }


  const buyItemDirect = (id, price) => {

    const account = accounts[0]
    const contract = contractMarketplace;

    // const index = 0;
    const productId = id /* lastProductsObj[index].id; */
    const amount = price /* lastProductsObj[index].price; */
    console.log(id, price)

    contract.methods.buyProduct(productId).send({ from: account, value: amount })
  }


  const handleInputName = e => {
    setInputName(e.target.value);
    validateInput(e);
  };

  const handleInputPrice = e => {
    setInputPrice(e.target.value);
    validateInput(e);
  }

  const handleInputId = e => {
    setInputId(e.target.value);
    validateInput(e);
  }

  const handleInputAmount = e => {
    setInputAmount(e.target.value);
    validateInput(e);
  }

  const validateInput = e => {
    e.target.parentNode.classList.add("was-validated");
  };

  return (
    <div className="App">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Marketplace Dapp</h1>
        <p>A decentralized marketplace powered by Ethereum</p>
        <MetaMaskButton.Outline size={'medium'}>Connect with MetaMask</MetaMaskButton.Outline>
      </div>

      <h2>Smart Contract Tests</h2>
      <p>Contract: <strong> Marketplace </strong> </p>
      {/* {contractMarketplace.options.address} */}
      <p>Connected account: <strong> {accounts} </strong> </p>
      <p>Products online: <strong> {count} </strong> </p>

      <Flex justifyContent='center'>
        <Box>
          <Form onSubmit={handleSubmitAddItem}>
            <Input type="text" placeholder="Enter product name" value={inputName} onChange={handleInputName} required={true} />
            <Input type="text" placeholder="Enter price in ETH" value={inputPrice} onChange={handleInputPrice} required={true} />
            <Input type="submit" value="Add product" />
          </Form>
        </Box>
      </Flex>

      <p></p>

      <Button size={'medium'} onClick={addItem}>
        Add random product
      </Button>

      <p></p>

      <Button size={'medium'} onClick={showProducts}>
        Show last products
      </Button>

      <p></p>

      <Table>
        <tbody>
          <tr>
            {productsIndexed.map(e =>
              <td><strong>Id {e.id}</strong></td>
            )}
          </tr>
          <tr>
            {productsIndexed.map(e =>
              <td>{e.name}</td>
            )}
          </tr>
          <tr>
            {productsIndexed.map(e =>
              <td>{Web3.utils.fromWei(e.price, 'ether')} ETH</td>
            )}
          </tr>
          <tr>
            {productsIndexed.map(e =>
              <td>
                <Button size={'medium'}>
                  Buy {e.index}
                </Button>
              </td>
            )}
          </tr>
        </tbody>
      </Table>

      <Flex justifyContent='center'>
        <Box>
          <Form onSubmit={handleSubmitBuyItem}>
            <Input type="text" placeholder="Enter product id" value={inputId} onChange={handleInputId} required={true} />
            <Input type="text" placeholder="Enter amount in ETH" value={inputAmount} onChange={handleInputAmount} required={true} />
            <Input type="submit" value="Buy product" />
          </Form>
        </Box>
      </Flex>

    </div>
    );
}

export default App;
