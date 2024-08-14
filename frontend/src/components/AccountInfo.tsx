import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const AccountInfo: React.FC = () => {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { address, isConnected, connector: activeConnector } = useAccount();
  const { disconnect } = useDisconnect();

  const handleConnect = (connector: any) => {
    connect({ connector });
  };

  const renderConnectWallet = () => (
    <div>
      <h2 className="text-2xl w-full font-bold text-gray-900 mb-4">
        Connect Wallet
      </h2>
      <div className="flex flex-wrap gap-2">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => handleConnect(connector)}
            type="button"
            className={`px-4 py-2 rounded transition ${
              isLoading && connector.id === pendingConnector?.id
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
            disabled={isLoading && connector.id === pendingConnector?.id}
          >
            {connector.name}
            {isLoading &&
              connector.id === pendingConnector?.id &&
              " (connecting)"}
          </button>
        ))}
      </div>
      {error && <div className="mt-4 text-red-500">{error.message}</div>}
    </div>
  );

  const renderAccountInfo = () => (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Account Information
      </h2>
      <div className="text-gray-700 space-y-2">
        <div>
          <span className="font-semibold">Address:</span> {address}
        </div>
        <div>
          <span className="font-semibold">Connector:</span>{" "}
          {activeConnector?.name || "None"}
        </div>
      </div>
      <button
        type="button"
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
        onClick={() => disconnect()}
      >
        Disconnect
      </button>
    </>
  );

  return (
    <div className="p-6 w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      {isConnected ? renderAccountInfo() : renderConnectWallet()}
    </div>
  );
};

export default AccountInfo;
