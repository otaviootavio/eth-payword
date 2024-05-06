import ContractInfo from "./components/ContractInfo";
import ContractWrite from "./components/ContractWrite";
import AccountInfo from "./components/AccountInfo";

function App() {
  return (
    <>
      <div>
        <AccountInfo />
      </div>
      <div>
        <ContractInfo />
      </div>
      <div>
        <ContractWrite />
      </div>
    </>
  );
}

export default App;
