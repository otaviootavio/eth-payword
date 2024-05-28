import ContractInfo from "./components/ContractInfo";
import ContractWrite from "./components/ContractWrite";
import AccountInfo from "./components/AccountInfo";

function App() {
  return (
    <>

      <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="bg-white w-full shadow-md p-4 flex justify-between items-center">
        <div className="text-blue-500 text-2xl font-bold bg-white">buyHashchain</div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4 w-full gap-10 pt-12">
          <AccountInfo />
          <ContractWrite />
          <ContractInfo />
      </main>
    </div>

    </>
  );
}

export default App;
