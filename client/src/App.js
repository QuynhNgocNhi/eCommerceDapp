import React, { useState, useEffect } from "react";
import { Box, Form, Input, Button, Flex, MetaMaskButton, Table, Card, Heading, Text } from "rimble-ui";
import logo from './logo.png';
import './App.css';
import CustomSwitch from "./component/CustomSwitch";
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
      Od01: Web3.utils.toWei('0.2', 'ether'),
      Od02: Web3.utils.toWei('0.1', 'ether'),
      Od03: Web3.utils.toWei('0.2', 'ether'),
      Od04: Web3.utils.toWei('0.3', 'ether')
    }

    const productName = Object.keys(productsObj)[Math.floor(Math.random() * Object.keys(productsObj).length)];
    const productPrice = productsObj[productName];

    await contract.methods.addProduct(productName, productPrice).send({ from: account });
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
    const numShown = 3;
    let index = 0;
    productsIndexed.length = 0;
    lastProductsObj.length = 0;

    for (let i = 0; i < numProducts; i++) {
      const post = await contract.methods.fetchProduct(i).call()
      setlastProductsObj((prevState => [...prevState, post]));
      //index++;



      productsIndexed.push({ index: index, id: post.id, name: post.name, price: post.price, state: post.state })
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
    alert('Contract will be paused/opened if initiated by owner');
    const account = accounts[0]
    await contract.methods.toggleCircuitBreaker().send({ from: account });
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

  const [PostTab, setPostTab] = useState(1);
  const onSelectSwitch = value => {
    setPostTab(value);
  };
  return (
    <div className="App" style={{ paddingBottom: 50 }}>
      {/* <Box width={[1, 2, 0.2]} mt={20}>
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
      </Box> */}
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>eCommerce DApp</h1>
        <p>A decentralized Order Payment powered by Ethereum</p>
        <Box width={[1, 1]} mt={20}>

          <Button style={{ height: 40, marginLeft: 10 }} variant="danger" onClick={toggleCircuitBreaker} width={[1, "auto", "auto"]} mr={3}>
            {isActive ? 'Pause' : 'Open'}
          </Button>

          <Button style={{ height: 40, marginLeft: 10 }} variant="success" onClick={killSwitch} width={[1, "auto", "auto"]} mt={[2, 0, 0]}>
            Kill
          </Button>
        </Box>
        <MetaMaskButton.Outline style={{ marginTop: 20, height: 50 }} size={'medium'} onClick={connectMetamask}>Connect with MetaMask</MetaMaskButton.Outline>
        <CustomSwitch
          selectionMode={1}
          option1="Create Order"
          option2="Pay my Order"

          onSelectSwitch={onSelectSwitch}
        />
      </div>

      <p>Current network id: <b> {networkId} </b> </p>
      <p>Playground status: <b> {isActive ? 'Open' : 'Closed. Please stand by!'} </b> </p>
      <p>Transactions online: <b> {count} </b> </p>
      <p>Connected account: <b> {accounts} </b> </p>


      {/*  <div>
        <Button size={'medium'} variant="danger" onClick={addItem} mt={20}>
        Add random Order
        </Button>
      </div> */}
      {PostTab == 1 &&
        (<Box width={[1, 1, 1]} mt={20}>
          <Form onSubmit={handleSubmitAddItem}>
            <Input style={{ height: 50, marginLeft: 10 }} type="text" placeholder="Enter Order name" value={inputName} onChange={handleInputName} required={true} />
            <Input style={{ height: 50, marginLeft: 10 }} type="text" placeholder="Enter amount in ETH" value={inputPrice} onChange={handleInputPrice} required={true} />
            <Input style={{ cursor: 'pointer', height: 50, marginLeft: 10, backgroundColor: "#28C081", width: 200 }} type="submit" value="Add custom Order" color="white" />
          </Form>
        </Box>)}
      {PostTab == 2 &&
        (<Form style={{ marginTop: 20 }} onSubmit={handleSubmitBuyItem}>
          <Input style={{ height: 50, marginLeft: 10 }} type="text" placeholder="Enter Order ID" value={inputId} onChange={handleInputId} required={true} />
          <Input style={{ height: 50, marginLeft: 10 }} type="text" placeholder="Enter amount in ETH" value={inputAmount} onChange={handleInputAmount} required={true} />
          <Input style={{ cursor: 'pointer', height: 50, marginLeft: 10, backgroundColor: "#DC2C10", width: 200 }} className="form-button" type="submit" value="Pay order" color="white" background="black" />
        </Form>)}
      <div className="App-content-button" style={{ marginTop: 40, display: 'flex', justifyContent: 'center', }}>

        <Card
          className="Content-button"
          onClick={showProducts}
          style={{
            borderRadius: 5,
            cursor: 'pointer',
            borderWidth: 2,
            borderColor: '#000000',
            padding: 10,
            height: 50,
            width: 300,
            fontSize: 18,
            color: 'white',
            justifyContent: 'space-between',
            backgroundColor: "#000000",


            alignItems: 'center',
          }}
        > Show latest transactions</Card>
      </div>

      <Box /* bg="grey" */ color="white" fontSize={4} p={4}>

        <Table>

          <tbody>
            <tr>
              <th scope="row">ID</th>
              {lastProductsObj.map(e =>
                <td><strong>Id {e.id}</strong></td>
              )}
            </tr>
            <tr>
              <th scope="row">Name</th>
              {lastProductsObj.map(e =>
                <td>{e.name}</td>
              )}
            </tr>
            <tr>
              <th scope="row">Amount</th>
              {lastProductsObj.map(e =>
                <td>{Web3.utils.fromWei(e.price, 'ether')} ETH</td>
              )}
            </tr>
            <tr>
              <th scope="row">Status</th>
              {lastProductsObj.map(e =>
                <td>{e.state === '0' ? "Available" : "Sold"}</td>
              )}
            </tr>
          </tbody>
        </Table>



      </Box>

      {/* <Box width={[1, 2, 0.2]} mt={20}>
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
      </Box> */}

    </div >
  );
}

export default App;
