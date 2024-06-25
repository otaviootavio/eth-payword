interface FunctionDebugData {
  entryPoint: number;
  id: string | null;
  parameterSlots: number;
  returnSlots: number;
}

interface Bytecode {
  functionDebugData: { [key: string]: FunctionDebugData };
  generatedSources: any[];
  object: string;
  opcodes: string;
  sourceMap: string;
  linkReferences: any;
}

interface Contract {
  abi: any[];
  devdoc: { kind: string; methods: any; version: number };
  evm: {
    assembly: string;
    bytecode: Bytecode;
    deployedBytecode: Bytecode;
    gasEstimates: any;
    legacyAssembly: any;
    methodIdentifiers: any;
  };
  metadata: string;
  storageLayout: any;
  userdoc: { kind: string; methods: any; version: number };
}

interface Contracts {
  [contractName: string]: Contract;
}

interface CompiledContracts {
  contracts: { [compiledContractName: string]: Contracts };
}
