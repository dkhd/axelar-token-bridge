import React, { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BigNumber, Contract, ethers } from "ethers";
import { useAccount, useBalance, useSigner } from "wagmi";
import { parseEther } from "ethers/lib/utils";

import sourceAbi from "../abis/DeployOnSourceChain.json";
import destinationAbi from "../abis/DeployOnDestinationChain.json";
import gatewayAbi from "../abis/AxelarGateway.json";
import ierc20Abi from "../abis/IERC20.json";

import { getTokenBalance } from "../utils/";

import {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} from "@axelar-network/axelarjs-sdk";

export default function Home() {
  const [tokenAmount, setTokenAmount] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState("");
  // const [tokenId, setTokenId] = useState("");
  const [currentTokenBalance, setCurrentTokenBalance] = useState("");

  const { data: signer } = useSigner();
  const { address: currentAddress, connector, isConnected } = useAccount();

  // WMATIC Contract Address
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS!;

  const {
    data: balance,
    isError,
    isLoading,
  } = useBalance({
    address: currentAddress as `0x${string}`,
    token: tokenAddress as `0x${string}`,
  });

  const sourceContract = new Contract(
    process.env.NEXT_PUBLIC_SOURCE_CONTRACT_ADDRESS!,
    sourceAbi.abi,
    signer!
  );

  const destinationContract = new Contract(
    process.env.NEXT_PUBLIC_DESTINATION_CONTRACT_ADDRESS!,
    destinationAbi.abi,
    signer!
  );

  // Address taken from docs https://docs.axelar.dev/dev/build/contract-addresses/testnet
  const gatewayContract = new Contract(
    "0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B",
    gatewayAbi.abi,
    signer!
  );

  async function requestApproval() {
    const tokenContract = new Contract(tokenAddress, ierc20Abi.abi, signer!);
    const approvalTxn = await tokenContract.approve(
      sourceContract.address, // change to source contract address (deployed by user on Polygon)
      ethers.utils.parseUnits(tokenAmount)
    );
    await approvalTxn.wait();
  }

  async function transferToken() {
    const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

    const gasFee = BigInt(
      Math.floor(
        Number(
          await api.estimateGasFee(
            EvmChain.POLYGON,
            EvmChain.MOONBEAM,
            GasToken.MATIC,
            700000,
            2
          )
        )
      )
    );

    const transferTxn = await sourceContract.sendToken(
      "Moonbeam",
      destinationContract.address,
      [destinationAddress],
      "WMATIC",
      ethers.utils.parseUnits(tokenAmount),
      tokenAddress,
      {
        value: gasFee,
      }
    );
    await transferTxn.wait();
  }

  async function transferBtnHandler() {
    await requestApproval();
    await transferToken();
  }

  useEffect(() => {
    if (balance)
      setCurrentTokenBalance(`${balance?.formatted} ${balance?.symbol}`);
    else setCurrentTokenBalance(`0.0 WMATIC`);
  }, [balance]);

  useEffect(() => {
    setIsWalletConnected(isConnected);
  }, [isConnected]);

  return (
    <div className="min-h-screen w-full bg-yellow-50">
      <div className="flex flex-row py-3 px-20 items-center space-x-5">
        <div className="grow"></div>
        <ConnectButton />
      </div>
      <div className="flex flex-col w-1/3 mx-auto bg-white border-2 border-yellow-500 mt-20 p-5 rounded-xl">
        <span className="text-center text-xl font-bold">Send WMATIC</span>
        <span className="mt-2">Amount:</span>
        <div className="flex  items-center bg-gray-50 rounded-xl mt-2">
          <input
            type="number"
            placeholder="0"
            className="bg-gray-50 p-3 rounded-xl grow"
            onChange={(e) => setTokenAmount(e.target.value)}
            disabled={!isWalletConnected}
          ></input>
          <div className="flex flex-row space-x-1 pr-4">
            <img
              src="https://polygonscan.com/token/images/wMatic_32.png"
              width={20}
              height={20}
            />
            <span>WMATIC</span>
          </div>
        </div>
        <span className="text-sm font-thin">
          Available: {currentTokenBalance}
        </span>
        <span className="mt-5">Destination Address (Moonbeam):</span>
        <div className="flex  items-center bg-gray-50 rounded-xl mt-2">
          <input
            placeholder="0x"
            className="bg-gray-50 p-3 rounded-xl grow"
            onChange={(e) => setDestinationAddress(e.target.value)}
            disabled={!isWalletConnected}
          ></input>
        </div>
        <button
          className="p-3 border text-red-500 border-yellow-500 bg-yellow-300 rounded-xl m-5 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-300 hover:bg-yellow-100"
          onClick={transferBtnHandler}
          disabled={!isWalletConnected}
        >
          Transfer
        </button>
      </div>
    </div>
  );
}
