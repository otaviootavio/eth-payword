import React, { createContext, useContext, useState, ReactNode } from "react";
import { z } from "zod";
import {
  HashChainElementSchema,
  SecretLengthSchema,
} from "../../utils/zod-schemas";

export interface HashChainElement {
  hash: string;
  index: number;
}

export interface HashChainExtensionContextType {
  hashChainElements: HashChainElement[];
  tail: string;
  fullHashChain: string[];
  secret: string;
  length: number;
  fetchAndPopHashFromHashChain: () => Promise<HashChainElement>;
  fetchTail: () => Promise<string>;
  fetchHashChain: () => Promise<string[]>;
  fetchSecretAndLength: () => Promise<{
    secret: string;
    length: number;
    tail: string;
  }>;
}

interface HashChainExtensionProviderProps {
  children: ReactNode;
}

const HashchainFromExtensionContext = createContext<
  HashChainExtensionContextType | undefined
>(undefined);

export const HashChainExtensionProvider: React.FC<
  HashChainExtensionProviderProps
> = ({ children }) => {
  const [hashChainElements, setHashChainElements] = useState<
    z.infer<typeof HashChainElementSchema>[]
  >([]);
  const [tail, setTail] = useState<string>("");
  const [fullHashChain, setFullHashChain] = useState<string[]>([]);
  const [secret, setSecret] = useState<string>("");
  const [length, setLength] = useState<number>(0);

  const createEventPromise = <T,>(eventType: string): Promise<T> => {
    return new Promise((resolve) => {
      const handler = (event: MessageEvent) => {
        if (event.data.type === eventType) {
          window.removeEventListener("message", handler);
          resolve(event.data as T);
        }
      };
      window.addEventListener("message", handler);
    });
  };

  const fetchAndPopHashFromHashChain = async (): Promise<
    z.infer<typeof HashChainElementSchema>
  > => {
    window.postMessage({ type: "RequestHashChain" }, "*");
    const response = await createEventPromise<{
      type: string;
      data: { hash: string; index: number };
    }>("HashChain");
    console.log(response.data);
    const newElement = HashChainElementSchema.parse({
      hash: response.data.hash,
      index: response.data.index,
    });
    setHashChainElements((prev) => [...prev, newElement]);
    return newElement;
  };

  const fetchTail = async (): Promise<string> => {
    window.postMessage({ type: "Send_h(100)" }, "*");
    const response = await createEventPromise<{ type: string; data: string }>(
      "Recover_h(100)",
    );
    setTail(response.data);
    return response.data;
  };

  const fetchHashChain = async (): Promise<string[]> => {
    window.postMessage({ type: "RequestFullHashChain" }, "*");
    const response = await createEventPromise<{ type: string; data: string[] }>(
      "fullHashChain",
    );
    console.log(response.data);
    setFullHashChain(response.data);
    return response.data;
  };

  const fetchSecretAndLength = async (): Promise<
    z.infer<typeof SecretLengthSchema>
  > => {
    window.postMessage({ type: "RequestSecretLength" }, "*");
    try {
      const response = await createEventPromise<{
        type: string;
        data: {
          secret: string;
          length: number;
          tail: string;
        };
      }>("SecretLength");
      const validatedResponse = SecretLengthSchema.parse({
        secret: response.data.secret,
        length: response.data.length,
        tail: response.data.tail,
      });
      setSecret(validatedResponse.secret);
      setLength(validatedResponse.length);
      return validatedResponse;
    } catch (error) {
      console.error("Error in fetchSecretLength:", error);
      throw error;
    }
  };

  const contextValue: HashChainExtensionContextType = {
    hashChainElements,
    tail,
    fullHashChain,
    secret,
    length,
    fetchAndPopHashFromHashChain,
    fetchTail,
    fetchHashChain,
    fetchSecretAndLength,
  };

  return (
    <HashchainFromExtensionContext.Provider value={contextValue}>
      {children}
    </HashchainFromExtensionContext.Provider>
  );
};

export const useHashChainFromExtension = () => {
  const context = useContext(HashchainFromExtensionContext);
  if (context === undefined) {
    throw new Error(
      "useHashChainFromExtension must be used within a HashChainExtensionProvider",
    );
  }
  return context;
};
