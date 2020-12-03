import React, { useState, useEffect } from "react";
import { Box, Form, Input, Button, Flex, MetaMaskButton, Table, Card, Heading, Text } from "rimble-ui";
import logo from './logo.png';
import './App.css';
import Web3 from "web3";
import getWeb3 from "./getWeb3";
import MarketplaceContract from "./contracts/Marketplace.json";
import { MarketplaceDeployed } from "./abi/MarketplaceDeployed.js";
// import { contracts_build_directory } from "../../truffle-config";

function App() {
  // const [state, setstate] = useState(initialState)
  const [count, setCount] = useState(0);
  const [index, setIndex] = useState(0);
  const [lastProductsObj, setlastProductsObj] = useState([]);
  const [productsIndexed, setProductsIndexed] = useState([]);
  const [inputName, setInputName] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [inputId, setInputId] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [networkId, setNetworkId] = useState("");
  const [contract, setContract] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [isActive, setIsActive] = useState("");

  // Comment option 1 or 2, then set corresponding address
  useEffect(() => {
    const init = async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the Marketplace contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = MarketplaceContract.networks[networkId];
        const contract = new web3.eth.Contract(
          MarketplaceContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        // Init state
        const count = await contract.methods.getCount().call();
        const status = await contract.methods.getContractStatus().call();

        setAccounts(accounts);
        setContract(contract);
        setCount(count);
        setIsActive(status);
        setNetworkId(networkId);

      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Be sure to be on network id 5 or 5777.`,
        );
        console.error(error);
      }
    }
    init();
  }, [accounts]);

  const addItem = async (t) => {
    t.preventDefault();
    const account = accounts[0];

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
    window.location.reload();
  };


  const showProducts = async (t) => {
    // t.preventDefault();
    const numProducts = await contract.methods.getCount().call();
    const numShown = 5;
    let index = 0;
    productsIndexed.length = 0;
    lastProductsObj.length = 0;

    for (let i = numProducts - 1; i > numProducts - numShown; i--) {
      const post = await contract.methods.fetchProduct(i).call()
      setlastProductsObj((prevState => [...prevState, post]));
      index ++
      productsIndexed.push({index: index, id: post.id, name: post.name, price: post.price})
      // Push post to array
    }
  }

  const handleSubmitAddItem = async (e) => {
    alert('A product was added: ' + inputName + inputPrice);

    e.preventDefault();
    const account = accounts[0]
    const productName = inputName;
    const productPrice = Web3.utils.toWei(inputPrice, 'ether');

    await contract.methods.addProduct(productName, productPrice).send({ from: account });
    // Alternative with gas estimate
    // const gas = await contract.methods.addProduct(productName, productPrice).estimateGas();
    // const post = await contract.methods.addProduct(productName, productPrice).send({
    //   from: account,
    //   gas,
    // });
    showProducts();
  }

  const handleSubmitBuyItem = async e => {
    alert('Id of product to be purchased: ' + inputId);
    e.preventDefault();
    const account = accounts[0]

    const productId = inputId;
    const amount = Web3.utils.toWei(inputAmount, 'ether');

    await contract.methods.buyProduct(productId).send({ from: account, value: amount })
    window.location.reload();
  }


  const buyItemDirect = (id, price) => {

    const account = accounts[0]

    // const index = 0;
    const productId = id /* lastProductsObj[index].id; */
    const amount = price /* lastProductsObj[index].price; */
    console.log(id, price)

    contract.methods.buyProduct(productId).send({ from: account, value: amount })
  }


  const toggleCircuitBreaker = async (e) => {
    e.preventDefault();
    alert('Contract will be paused if initiated by owner');
    const account = accounts[0]
    await contract.methods.toggleCircuitBreaker().send({from: account});
    window.location.reload();
  }

  const killSwitch = (e) => {
    e.preventDefault();
    alert('Contract will be killed if initiated by owner');
    const account = accounts[0]
    contract.methods.kill().send({ from: account });
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


  const connectMetamask = async (e) => {
    e.preventDefault();
    await window.ethereum.enable();
    window.location.reload();
  }


  return (
    <div className="App">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Marketplace DApp</h1>
        <p>A decentralized marketplace powered by Ethereum</p>
        <MetaMaskButton.Outline size={'medium'} onClick={connectMetamask}>Connect with MetaMask</MetaMaskButton.Outline>
      </div>

      <h2>Smart Contract Interaction</h2>
      <p>Connected account: <b> {accounts} </b> </p>
      <p>Current network id: <b> {networkId} </b> </p>
      <p>Marketplace status: <b> {isActive ? 'Open' : 'Closed. Please stand by!'} </b> </p>
      <p>Products online: <b> {count} </b> </p>

      <Box width={[1, 1, 1]} mt={20}>
        <Form onSubmit={handleSubmitAddItem}>
          <Input type="text" placeholder="Enter product name" value={inputName} onChange={handleInputName} required={true} />
          <Input type="text" placeholder="Enter price in ETH" value={inputPrice} onChange={handleInputPrice} required={true} />
          <Input type="submit" value="Add custom product" color="green" />
        </Form>
      </Box>

      <div>
        <Button size={'medium'} onClick={addItem} mt={20}>
          Add random product
        </Button>
      </div>

      <div>
        <Button size={'medium'} variant="success" onClick={showProducts} mt={20}>
          Show latest products
        </Button>
      </div>

      <Box /* bg="grey" */ color="white" fontSize={4} p={4}>

        <Table>
          <tbody>
            <tr>
              {lastProductsObj.map(e =>
                <td><strong>Id {e.id}</strong></td>
                )}
            </tr>
            <tr>
              {lastProductsObj.map(e =>
                <td>{e.name}</td>
                )}
            </tr>
            <tr>
              {lastProductsObj.map(e =>
                <td>{Web3.utils.fromWei(e.price, 'ether')} ETH</td>
                )}
            </tr>
            <tr>
              {lastProductsObj.map(e =>
                <td>{e.state == 0 ? "Available" : "Sold"}</td>
              )}
            </tr>
          </tbody>
        </Table>

          <Form onSubmit={handleSubmitBuyItem}>
            <Input type="text" placeholder="Enter product id" value={inputId} onChange={handleInputId} required={true} />
            <Input type="text" placeholder="Enter amount in ETH" value={inputAmount} onChange={handleInputAmount} required={true} />
            <Input type="submit" value="Buy selected product" color="blue"/>
          </Form>

      </Box>

      <Box width={[1, 2, 0.2]} mt={20}>
        <Card width={"auto"} maxWidth={"420px"} mx={"auto"} px={[3, 3, 4]}>
          <Heading>Admin Functions</Heading>

          <Box>
            <Text mb={4}>
              Only accessible to the owner of the smart contract. Use with care!
            </Text>
          </Box>

          <Button variant="danger" onClick={toggleCircuitBreaker} width={[1, "auto", "auto"]} mr={3}>
            Pause
          </Button>

          <Button.Outline variant="danger" onClick={killSwitch} width={[1, "auto", "auto"]} mt={[2, 0, 0]}>
            Kill
          </Button.Outline>
        </Card>
      </Box>

    </div>
    );
}

export default App;
