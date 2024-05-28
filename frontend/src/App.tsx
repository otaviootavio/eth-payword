import ContractInfo from "./components/ContractInfo";
import ContractWrite from "./components/ContractWrite";
import AccountInfo from "./components/AccountInfo";

function App() {
  return (
    <>

      <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="bg-white w-full shadow-md p-4 flex justify-between items-center">
        <div className="text-blue-500 text-2xl font-bold bg-white">buyHashchain</div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Conectar Carteira</button>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-md rounded p-6 max-w-md w-full">
          <AccountInfo />
          <ContractWrite />
          <ContractInfo />
        </div>
      </main>
    </div>

    </>
  );
}

export default App;
