/* Set this after deploying Bank.sol to Sepolia. Keep the 0x prefix. */
const BANK_CONTRACT_ADDRESS = "0xd7C4B883481c901A7a61004391e92971f4B20843";

const BANK_ABI = [
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "function checkBalance() view returns (uint256)",
  "event Deposit(address indexed owner, uint256 amount)",
  "event Withdrawal(address indexed owner, uint256 amount)",
];

const SEPOLIA_CHAIN_ID = 11155111n;
const SEPOLIA_HEX_CHAIN_ID = "0xaa36a7";

const elements = {
  connectButton: document.querySelector("#connect-button"),
  switchNetworkButton: document.querySelector("#switch-network-button"),
  walletStatus: document.querySelector("#wallet-status"),
  walletAddress: document.querySelector("#wallet-address"),
  balanceValue: document.querySelector("#balance-value"),
  refreshButton: document.querySelector("#refresh-button"),
  depositForm: document.querySelector("#deposit-form"),
  depositAmount: document.querySelector("#deposit-amount"),
  withdrawForm: document.querySelector("#withdraw-form"),
  withdrawAmount: document.querySelector("#withdraw-amount"),
  statusPanel: document.querySelector("#status-panel"),
  statusMessage: document.querySelector("#status-message"),
  networkPill: document.querySelector(".network-pill"),
};

let provider;
let signer;
let account = "";
let chainId = 0n;

function setStatus(message, kind = "info", transactionHash = "") {
  elements.statusPanel.dataset.kind = kind;
  elements.statusMessage.textContent = message;
  if (transactionHash) {
    const link = document.createElement("a");
    link.href = `https://sepolia.etherscan.io/tx/${encodeURIComponent(transactionHash)}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = " ดูธุรกรรมบน Etherscan";
    elements.statusMessage.append(link);
  }
}

function isContractConfigured() {
  return /^0x[a-fA-F0-9]{40}$/.test(BANK_CONTRACT_ADDRESS);
}

function shortenAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatEth(value) {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const unit = 10n ** 18n;
  const whole = absolute / unit;
  const fraction = (absolute % unit).toString().padStart(18, "0").slice(0, 6).replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}

function setBusy(busy) {
  document.querySelectorAll("button, input").forEach((control) => {
    control.disabled = busy;
  });
}

function updateWalletView() {
  elements.walletStatus.textContent = account ? "เชื่อมต่อแล้ว" : "ยังไม่ได้เชื่อมต่อ";
  elements.walletAddress.textContent = account ? account : "เชื่อม MetaMask เพื่อเริ่มใช้งาน";
  elements.connectButton.textContent = account ? shortenAddress(account) : "เชื่อมต่อ MetaMask";
  elements.switchNetworkButton.hidden = !account || chainId === SEPOLIA_CHAIN_ID;
  elements.networkPill.dataset.kind = chainId === SEPOLIA_CHAIN_ID ? "success" : "warning";
  elements.networkPill.lastChild.textContent = chainId === SEPOLIA_CHAIN_ID ? " Sepolia Testnet" : " เปลี่ยนเครือข่ายเป็น Sepolia";
  elements.balanceValue.textContent = "—";
}

function requireReady() {
  if (!window.ethereum) throw new Error("ไม่พบ MetaMask กรุณาติดตั้งหรือเปิดใช้งานส่วนขยาย MetaMask");
  if (!account || !signer) throw new Error("กรุณาเชื่อมต่อ MetaMask ก่อน");
  if (chainId !== SEPOLIA_CHAIN_ID) throw new Error("กรุณาสลับ MetaMask ไปยัง Sepolia Testnet");
  if (!isContractConfigured()) throw new Error("ยังไม่ได้ตั้งค่า contract address ใน app.js");
}

function getBank(withSigner = false) {
  const runner = withSigner ? signer : provider;
  return new ethers.Contract(BANK_CONTRACT_ADDRESS, BANK_ABI, runner);
}

async function refreshBalance() {
  try {
    requireReady();
    const balance = await getBank(true).checkBalance();
    elements.balanceValue.textContent = formatEth(balance);
  } catch (error) {
    elements.balanceValue.textContent = "—";
    if (account) setStatus(error.message || "อ่านยอดคงเหลือไม่สำเร็จ", "error");
  }
}

async function readWalletState() {
  if (!window.ethereum) return;
  provider = new ethers.BrowserProvider(window.ethereum);
  const [accounts, network] = await Promise.all([
    provider.send("eth_accounts", []),
    provider.getNetwork(),
  ]);
  chainId = network.chainId;
  account = accounts[0] || "";
  signer = account ? await provider.getSigner(account) : undefined;
  updateWalletView();
  if (account) {
    await refreshBalance();
    if (chainId !== SEPOLIA_CHAIN_ID) {
      setStatus("กรุณาสลับ MetaMask เป็น Sepolia เพื่อใช้งานสัญญา", "error");
    } else if (!isContractConfigured()) {
      setStatus("ยังไม่ได้ตั้งค่า contract address ใน app.js", "error");
    } else {
      setStatus("เชื่อมต่อ Bank บน Sepolia แล้ว", "success");
    }
  }
}

async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error("ไม่พบ MetaMask กรุณาติดตั้งหรือเปิดใช้งานส่วนขยาย MetaMask");
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    await readWalletState();
    if (chainId !== SEPOLIA_CHAIN_ID) {
      setStatus("เชื่อมต่อแล้ว กรุณาสลับเครือข่ายเป็น Sepolia เพื่อใช้งานสัญญา", "error");
    } else if (!isContractConfigured()) {
      setStatus("เชื่อมต่อแล้ว ให้นำ contract address หลัง deploy ไปใส่ใน app.js", "error");
    } else {
      setStatus("เชื่อมต่อ MetaMask สำเร็จ", "success");
    }
  } catch (error) {
    setStatus(error.message || "เชื่อมต่อ wallet ไม่สำเร็จ", "error");
  }
}

async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_HEX_CHAIN_ID }],
    });
  } catch (error) {
    setStatus(error.message || "สลับไป Sepolia ไม่สำเร็จ", "error");
  }
}

async function sendTransaction(action, successMessage) {
  setBusy(true);
  try {
    requireReady();
    const tx = await action();
    setStatus(`ส่งธุรกรรมแล้ว: ${tx.hash} กำลังรอการยืนยัน`, "info", tx.hash);
    await tx.wait();
    await refreshBalance();
    setStatus(successMessage, "success", tx.hash);
    return true;
  } catch (error) {
    setStatus(error.shortMessage || error.reason || error.message || "ธุรกรรมไม่สำเร็จ", "error");
    return false;
  } finally {
    setBusy(false);
  }
}

elements.connectButton.addEventListener("click", connectWallet);
elements.switchNetworkButton.addEventListener("click", switchToSepolia);
elements.refreshButton.addEventListener("click", refreshBalance);

elements.depositForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const value = ethers.parseEther(elements.depositAmount.value.trim());
    if (value <= 0n) throw new Error("จำนวนฝากต้องมากกว่า 0 ETH");
    const succeeded = await sendTransaction(
      () => getBank(true).deposit({ value }),
      "ฝาก ETH สำเร็จ",
    );
    if (succeeded) elements.depositForm.reset();
  } catch (error) {
    setStatus(error.message || "กรุณาตรวจสอบจำนวน ETH", "error");
  }
});

elements.withdrawForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    requireReady();
    const amount = ethers.parseEther(elements.withdrawAmount.value.trim());
    if (amount <= 0n) throw new Error("จำนวนถอนต้องมากกว่า 0 ETH");
    const currentBalance = await getBank(true).checkBalance();
    if (amount > currentBalance) throw new Error("ยอดเงินในสัญญาไม่เพียงพอ");
    const succeeded = await sendTransaction(
      () => getBank(true).withdraw(amount),
      "ถอน ETH สำเร็จ",
    );
    if (succeeded) elements.withdrawForm.reset();
  } catch (error) {
    setStatus(error.shortMessage || error.reason || error.message || "กรุณาตรวจสอบจำนวน ETH", "error");
  }
});

if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => {
    readWalletState().catch((error) => setStatus(error.message, "error"));
  });
  window.ethereum.on("chainChanged", () => window.location.reload());
  readWalletState().catch((error) => setStatus(error.message, "error"));
} else {
  setStatus("ไม่พบ MetaMask: สามารถอ่านหน้าเว็บได้ แต่ต้องติดตั้ง MetaMask เพื่อฝากหรือถอน ETH", "error");
}

if (window.location.protocol === "file:") {
  setStatus("เปิดหน้านี้ผ่าน file:// อยู่ — ให้เปิดผ่าน localhost หรือ GitHub Pages ก่อนเชื่อม MetaMask", "error");
} else if (!window.ethereum) {
  setStatus("ไม่พบ MetaMask ในเบราว์เซอร์นี้ กรุณาเปิดส่วนขยาย MetaMask แล้วโหลดหน้าใหม่", "error");
} else if (!isContractConfigured()) {
  setStatus("ตั้งค่า contract address ใน app.js หลัง deploy Bank.sol บน Sepolia", "info");
}
