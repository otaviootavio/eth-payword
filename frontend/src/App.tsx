import { useAccount } from "wagmi";
import AccountInfo from "./components/AccountInfo";
import DeployContract from "./components/DeployContract";
import QuerySmartContract from "./components/QuerySmartContract";
import { HashChainExtensionProvider } from "./contexts/wallet/HashChainExtensionProvider";

function App() {
  const { address } = useAccount();
  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center">
        <header className="bg-white w-full shadow-md p-4 flex justify-between items-center">
          <div className="text-blue-500 text-2xl font-bold bg-white">
            buyHashchain
          </div>
        </header>
        <main className="flex-grow flex flex-col items-start justify-start p-4 gap-10 pt-12">
          <HashChainExtensionProvider>
            <AccountInfo />
            {address && (
              <>
                <DeployContract />
                <QuerySmartContract />
              </>
            )}
          </HashChainExtensionProvider>
        </main>
      </div>
    </>
  );
}

export default App;
