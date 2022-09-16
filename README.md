# BeaconAMM V1 Subgraph
Subgraph to index beaconAMM V1 contract events and stats

To build:  
- `yarn init --yes`
- `yarn add @graphprotocol/graph-cli`
- `yarn codegen`
- `yarn build`
- `graph auth --studio {deployKey}`
- `graph deploy --studio {subgraphName}`
- `graph deploy 0xum1ng/beaconammv1-goerli --ipfs https://api.thegraph.com/ipfs/ --node https://api.thegraph.com/deploy/ --debug`
