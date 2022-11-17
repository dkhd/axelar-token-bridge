import React, { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BigNumber, Contract, ethers } from "ethers";
import { useAccount, useSigner } from "wagmi";
import { parseEther } from "ethers/lib/utils";

import sourceAbi from "../abis/DeployOnSourceChain.json";
import destinationAbi from "../abis/DeployOnDestinationChain.json";
import gatewayAbi from "../abis/AxelarGateway.json";
import ierc20Abi from "../abis/IERC20.json";

import {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} from "@axelar-network/axelarjs-sdk";

export default function Home() {
  // const [tokenAmount, setTokenAmount] = useState(BigNumber.from("0"));
  // const [isWalletConnected, setIsWalletConnected] = useState(false);
  // const [smartContractAddress, setSmartContractAddres] = useState("");
  // const [tokenId, setTokenId] = useState("");

  const { data: signer } = useSigner();
  const { address, connector, isConnected } = useAccount();

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
    const tokenAddress = await gatewayContract.tokenAddresses("aUSDC");
    const tokenContract = new Contract(tokenAddress, ierc20Abi.abi, signer!);
    const approvalTxn = await tokenContract.approve(
      sourceContract.address, // change to source contract address (deployed by user on Polygon)
      ethers.utils.parseUnits("1", 6)
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
      [address],
      "aUSDC",
      ethers.utils.parseUnits("1", 6),
      {
        value: gasFee,
      }
    );
    await transferTxn.wait();
  }

  async function transferBtnHandler() {
    console.log("transfer click");
    await requestApproval();
    await transferToken();
  }

  return (
    <div>
      <div className="flex flex-row w-full py-3 px-20 items-center space-x-5">
        <div className="grow"></div>
        <ConnectButton />
      </div>
      <button
        className="p-3 border border-black rounded-xl m-5"
        onClick={transferBtnHandler}
      >
        Transfer
      </button>
    </div>
  );
}
