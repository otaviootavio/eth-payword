import { useAccount, useConnect, useDisconnect } from "wagmi";

const AccountInfo = () => {
  const { connectors, connect, status, error } = useConnect();
  const account = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Account</h2>
      <div className="text-gray-700">
        <div>
          <span className="font-semibold">Status:</span> {account.status}
        </div>
        <div>
          <span className="font-semibold">Addresses:</span> {JSON.stringify(account.addresses)}
        </div>
        <div>
          <span className="font-semibold">Chain ID:</span> {account.chainId}
        </div>
      </div>
      {account.status === "connected" && (
        <button
          type="button"
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      )}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Connect</h2>
        <div className="space-y-2">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
            >
              {connector.name}
            </button>
          ))}
        </div>
        <div className="mt-4 text-gray-500">{status}</div>
        {error && <div className="mt-2 text-red-500">{error.message}</div>}
      </div>
    </div>
  );
};

export default AccountInfo;
