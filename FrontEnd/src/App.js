import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import MetaHorseNFT from "./MetaHorseNFT.json";
import "./App.css";

const CONTRACT_ADDRESS = "0x8e94942b0a789aca327261445d846062c23a6eab";
const POLYGON_AMOY_CHAINID = "0x13882"; // Hex for 80002

function isValidTitle(title) {
  return /^(?! )[A-Za-z0-9 ]{3,}(?<! )$/.test(title);
}

function isValidForm({ tokenId, title, uri }) {
  return (
    tokenId &&
    String(tokenId).trim() !== "" &&
    title &&
    isValidTitle(title) &&
    uri &&
    String(uri).trim() !== ""
  );
}

export default function App() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({ title: "", uri: "", tokenId: "" });
  const [minting, setMinting] = useState(false);
  const [chainId, setChainId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [txStatus, setTxStatus] = useState(""); // "pending", "success", "fail"


  // Derived UI state
  const isWalletConnected = !!address;
  const isOnPolygonAmoy = chainId === POLYGON_AMOY_CHAINID;
  const isFormValid = isValidForm(form);
  const canMint = isWalletConnected && isOnPolygonAmoy && isFormValid && !minting;

  // Connect MetaMask and setup listeners
  useEffect(() => {
    if (!window.ethereum) return;

    // Set current address and chain
    window.ethereum.request({ method: "eth_accounts" }).then(accounts => {
      if (accounts.length > 0) setAddress(accounts[0]);
    });
    window.ethereum.request({ method: "eth_chainId" }).then(id => setChainId(id));

    // Listen for chain/account changes
    const handleChain = id => setChainId(id);
    const handleAccounts = accounts => setAddress(accounts[0] || "");

    window.ethereum.on("chainChanged", handleChain);
    window.ethereum.on("accountsChanged", handleAccounts);

    // Cleanup on unmount
    return () => {
      window.ethereum.removeListener("chainChanged", handleChain);
      window.ethereum.removeListener("accountsChanged", handleAccounts);
    };
  }, []);

  // Switch to Polygon Amoy
  const switchToPolygonAmoy = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_AMOY_CHAINID }],
      });
      setStatus("Switched to Polygon Amoy.");
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: POLYGON_AMOY_CHAINID,
              chainName: "Polygon Amoy",
              rpcUrls: ["https://rpc-amoy.polygon.technology/"],
              nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
              blockExplorerUrls: ["https://www.oklink.com/amoy"]
            }]
          });
        } catch {
          setStatus("Failed to add Polygon Amoy network.");
        }
      } else {
        setStatus("Failed to switch network.");
      }
    }
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus("MetaMask is not installed.");
      return;
    }
    try {
      const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAddress(account);
      setStatus("");
    } catch {
      setStatus("Connection rejected.");
    }
  };

  // Handle form changes
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Mint NFT
  const mintNFT = async e => {
    e.preventDefault();
    setStatus("");
    setMinting(true);
    setTxHash("");
    setTxStatus(""); // Clear previous

    if (!canMint) {
      setStatus("Please complete the form and check your wallet/network.");
      setMinting(false);
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MetaHorseNFT.abi, signer);
      const tx = await contract.safeMint(address, form.tokenId, form.uri, form.title);

      setTxHash(tx.hash);
      setTxStatus("pending");

      await tx.wait();
      setTxStatus("success");
      setForm({ title: "", uri: "", tokenId: "" });
    } catch (err) {
      setTxStatus("fail");
      if (err?.info?.error?.message?.includes("TitleAlreadyUsed")) {
        setStatus("This title is already used.");
      } else if (err?.info?.error?.message?.includes("tokenIdPositive")) {
        setStatus("Token ID must be > 0.");
      } else {
        setStatus("Transaction failed: " + (err.reason || err.message));
      }
    } finally {
      setMinting(false);
    }
  };


  return (
    <div className="app-container">
      <h1>MetaHorse NFT Mint</h1>
      <button
        onClick={connectWallet}
        className={`wallet-btn${isWalletConnected ? " connected" : ""}`}
      >
        {isWalletConnected ? "Connected" : "Connect MetaMask"}
      </button>
      <button
        onClick={switchToPolygonAmoy}
        className={`network-btn${!isOnPolygonAmoy ? " warning" : ""}`}
        disabled={isOnPolygonAmoy}
      >
        {!isOnPolygonAmoy ? (
          <>
            <span role="img" aria-label="warning">⚠️</span>
            Switch to Polygon Amoy
          </>
        ) : (
          "Polygon Amoy Active"
        )}
      </button>
      {isWalletConnected && (
        <div style={{ marginBottom: 16 }}>
          Wallet: <span style={{ fontFamily: "monospace" }}>{address}</span>
        </div>
      )}
      {!isOnPolygonAmoy && (
        <div style={{ marginBottom: 16, color: "red" }}>
          ⚠️ You are on the wrong network. Please switch to <b>Polygon Amoy</b>.
        </div>
      )}
      <form onSubmit={mintNFT} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          name="tokenId"
          type="number"
          placeholder="Token ID (must be > 0)"
          value={form.tokenId}
          onChange={handleChange}
          min={1}
          className="input"
          required
        />
        <input
          name="title"
          placeholder="Unique Title"
          value={form.title}
          onChange={handleChange}
          className={form.title && !isValidTitle(form.title) ? "invalid" : ""}
          required
        />
        {form.title && !isValidTitle(form.title) && (
          <div style={{ color: "red", fontSize: 12 }}>
            Title must be 3+ chars, alphanumeric & spaces, no leading/trailing spaces.
          </div>
        )}
        <input
          name="uri"
          placeholder="Token URI (e.g., https://...)"
          value={form.uri}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          disabled={!canMint}
          className="mint-btn"
          tabIndex={canMint ? 0 : -1}
        >
          {minting ? "Minting..." : "Mint NFT"}
        </button>
      </form>
      {status && (
        <div
          className={
            "status-message " +
            (status.toLowerCase().includes("success") ? "status-success" : "status-error")
          }
        >
          {status}
        </div>
      )}
      {txHash && (
        <div
          className="tx-status-message"
          style={{
            marginTop: 16,
            padding: 10,
            borderRadius: 8,
            background: txStatus === "success"
              ? "#d4f7dc"
              : txStatus === "fail"
                ? "#ffe1e1"
                : "#fffbe7",
            color:
              txStatus === "success"
                ? "#125d25"
                : txStatus === "fail"
                  ? "#c60000"
                  : "#b39305",
            border: txStatus === "pending"
              ? "1.5px solid #b39305"
              : txStatus === "fail"
                ? "1.5px solid #c60000"
                : "1.5px solid #125d25"
          }}
        >
          {txStatus === "pending" && "Minting..."}
          {txStatus === "success" && "Success! "}
          {txStatus === "fail" && "Failed! "}
          <a
            href={`https://www.oklink.com/amoy/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
            style={{ marginLeft: 8 }}
          >
            View on Polygon Amoy Explorer
          </a>
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 12, color: "#888" }}>
        Powered by Imagination
      </div>
    </div>
  );
}