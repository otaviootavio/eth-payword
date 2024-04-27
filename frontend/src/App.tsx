import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  useReadEthWordChannelRecipient,
  useReadEthWordChannelSender,
  useReadEthWordChannelTip,
  useReadEthWordTotalWordCount,
} from "./generated";

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const { data: channelRecipient } = useReadEthWordChannelRecipient({
    address,
  });

  const { data: channelTip } = useReadEthWordChannelTip({
    address,
  });

  const { data: channelSender } = useReadEthWordChannelSender({
    address,
  });

  const { data: totalWordCount } = useReadEthWordTotalWordCount({
    address,
  });

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === "connected" && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
      <div>
        <h2>Contract info</h2>
        <p>Channel recipient: {channelRecipient}</p>
        <p>Channel tip: {channelTip}</p>
        <p>Channel sender: {channelSender}</p>
        <p>Total word count: {totalWordCount?.toString()}</p>
      </div>
    </>
  );
}

export default App;
