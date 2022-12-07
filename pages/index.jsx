import abi from '../utils/BuyMeACoffee.json';
import { ethers } from "ethers";
import Head from 'next/head'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0xB2Df3FBDB6dc4f2Dd2ce506aA457A9cD6320c1d6";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  
  const onNameChange = (event) => {
    setName(event.target.value);
  }
  
  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }
  
  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;
      
      const accounts = await ethereum.request({method: 'eth_accounts'})
      console.log("accounts: ", accounts);
      
      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }
  
  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      
      if (!ethereum) {
        console.log("please install MetaMask");
      }
      
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }
  
  async function buyCoffee(value='0'){
    try {
      const {ethereum} = window;
      
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
          );
          
          console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your  coffee!",
          {value: ethers.utils.parseEther(`${value}`)}
          );
          
          await coffeeTxn.wait();
          
          console.log("mined ", coffeeTxn.hash);
          
          console.log("coffee purchased!");
          
          // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };
  //Function to get money from contract to owner
  const withdraw = async()=>{

    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        console.log("fetching memos from the blockchain..");
        const withdrawTip = await buyMeACoffee.withdrawTips();
        console.log("fetched!");
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
    }
    

  }
  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        
        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
      
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000).toLocaleString(),
          message,
          name
        }
      ]);
    };

    const {ethereum} = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);
  
  return (
    <div className='bg-black text-white py-8 h-full '>
      <Head>
        <title>Buy Akshay a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`${styles.main} text-yellow `}>
        <h1 className={`${styles.title} `}>
          Buy Akshay a Coffee!
        </h1>
        
        {currentAccount ? (
          <div className='mx-auto w-full flex flex-col items-center justify-center content-center'>
            <form className='flex flex-col items-center py-4' action='#'>
              <div className="formgroup">
                <label className='font-thin text-lg'>
                  Name
                </label>
                <br/>
                
                <input
                  id="name"
                  type="text"
                  placeholder="Your Good Name"
                  onChange={onNameChange}
                  className='border px-2 border-yellow-100 w-48 text-black'
                  />
              </div>
              <br/>
              <div className="formgroup">
                <label>
                  Send Akshay a message
                </label>
                <br/>

                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  className='border px-2 border-yellow-100 w-48 text-black'
                >
                </textarea>
              </div>
              <div className=' py-4 flex gap-4 flex-wrap'>
                <button
                  type="button"
                  className='border border-orange-400 hover:bg-orange-400 hover:text-white px-4 rounded-md'
                  onClick={()=>{
                    buyCoffee('0.001')
                  }}
                >
                  Send 1 small Coffee for 0.001ETH
                </button>
                <button
             
                className='border border-orange-400 px-4 hover:bg-orange-400 hover:text-white rounded-md'
                onClick={()=>{
                  buyCoffee('0.005')
                }}
              >
                Send 1 medium Coffee for 0.005ETH
              </button>
                <button
               
                className='btn border border-orange-400 px-4 hover:bg-orange-400 hover:text-white rounded-md'
                onClick={()=>{
                  buyCoffee('0.015')
                }}
              >
                Send 1 large Coffee for 0.015ETH
              </button>

              </div>
            </form>

            <button onClick={withdraw} className='btn border border-red-400 px-4 hover:bg-red-400 hover:text-white rounded-md'>Withdraw Collected Money</button>
          </div>
        ) : (
          <button className='border-full border rounded-md m-4 bg-slate-800 text-white hover:bg-slate-100 hover:text-black px-2'onClick={connectWallet}> Connect your  wallet </button>
        )}
      </main>

      {currentAccount && (<h1 className='ml-2 text-yellow-300 uppercase tracking-loose text-center py-4'>Memos received</h1>)}
<div className='grid  grid-cols-4 '>
{currentAccount && (memos.map((memo, idx) => {
  return (
    <div key={idx} style={{border:"2px solid", "border-radius":"5px", padding: "5px", margin: "5px"}}>
    <p style={{"font-weight":"bold"}}>"{memo.message}"</p>
    <p>From: {memo.name} at {memo.timestamp.toString()}</p>
    </div>
    )
  }))}
  </div>

    </div>
  )
}
