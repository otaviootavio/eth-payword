import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface HashChainContextType {
  hashChainElements: { data: string; index: number }[];
  h100: string;
  fetchHashChain: () => void;
  sendH100Once: () => void;
}

interface HashChainExtensionProviderProps {
  children: ReactNode;
}

const HashChainContext = createContext<HashChainContextType | undefined>(
  undefined,
);

export const HashChainExtensionProvider: React.FC<
  HashChainExtensionProviderProps
> = ({ children }) => {
  const [hashChainElements, setHashChainElements] = useState<
    { data: string; index: number }[]
  >([]);
  const [h100, setH100] = useState<string>("");

  const handleResponse = (event: MessageEvent) => {
    if (event.data.type === "HashChain") {
      setHashChainElements((prev) => [
        ...prev,
        { data: event.data.data, index: event.data.index },
      ]);
    } else if (event.data.type === "Recover_h(100)") {
      setH100(event.data.data);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleResponse);
    return () => window.removeEventListener("message", handleResponse);
  }, []);

  const fetchHashChain = () => {
    window.postMessage({ type: "RequestHashChain" }, "*");
  };

  const sendH100Once = () => {
    window.postMessage({ type: "Send_h(100)" }, "*");
  };

  return (
    <HashChainContext.Provider
      value={{ hashChainElements, h100, fetchHashChain, sendH100Once }}
    >
      {children}
    </HashChainContext.Provider>
  );
};

export const useHashChain = () => {
  const context = useContext(HashChainContext);
  if (context === undefined) {
    throw new Error(
      "useHashChain must be used within a HashChainExtensionProvider",
    );
  }
  return context;
};
