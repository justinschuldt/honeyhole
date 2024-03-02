# The Graph SubGraph for `honeypause` contract data
#### [EthDenver](https://www.ethdenver.com/) 2024 hackathon project

## This repo contains a SubGraph made for `honeypause` contracts, and a SubGrapah development environment.

###  tech stack
- `ScaffoldEth` with `graph-node` infra, from The Graph's [Kevin Jones](https://github.com/kmjones1979)' EthDenver 2024 talk ["Full Stack Dapp Development With Scaffold-ETH and The Graph"](https://www.ethdenver.com/agenda/full-stack-dapp-development-with-scaffold-eth-and-the-graph-9dbfd). Github [Repo](https://github.com/kmjones1979/full-stack-dapp-workshop/tree/main).
- [`@merklejerk`](https://github.com/merklejerk)'s [`HoneyPause.sol`](https://github.com/merklejerk/honeypause) + friends

### development environnment setup
#### prereqs
- nodejs, nvm
- yarn
- docker-compose
- `Anvil` from [`foundry`](https://github.com/foundry-rs/foundry)

### running the app

This is an abridged version of Kevin's [startup guide](). The SchaffoldEth2 + Graph combination is impressive and complicated, you'll probably have to debug your way through some part of this, as there are a bunch of different types and versions of software here. I ran this on an M1 Mac, and needed to update my local `podman` to get the networking working between the Graph's docker containers, FWIW.

After the inital `yarn install`, startup consists of running the 5 underlying parts:

1. Eth node: `anvil`
1.  Contract's build & deploy: `yarn deploy`
1. [ScaffoldEth2](https://github.com/scaffold-eth/scaffold-eth-2)'s nextjs web app: `yarn start`
1. theGraph's dev environment (uses `docker compose`): `yarn run-node`
1. subgraph's build & deploy `yarn local-create && yarn local-ship`

### notable files

- `HoneyPause.sol`, and my hacky [reference implementation contracts](/packages/hardhat/contracts/) of a Protocol, Brounties, pausing, and claiming funds.
    ```Solidity
    /// @notice An on-chain mechanism for atomically verifying an exploit,
    ///         pausing a protocol, and paying out a reward. Made possible
    ///         thanks to private mempools. Made for the EthDenver 2024 hackathon. 
    /// @author Lawrence Forman <@merklejerk>
    contract HoneyPause {
        using LibBytes for bytes;

        /// @dev A bounty record.
        struct Bounty {
            address operator;
            ERC20 payoutToken;
            uint256 payoutAmount;
            IVerifier verifier;
            IPauser pauser;
            IPayer payer; 
        }

    /// ...
    ```
- Subgraph manifest: [subgraph.yaml](/packages/subgraph/subgraph.yaml) that specifies what the Graph's `codegen` process should produce.
    ```yaml
    specVersion: 0.0.4
    description: HoneyPause
    repository: https://github.com/justinschuldt/honeyhole/packages/subgraph/
    schema:
      file: ./src/schema.graphql
    dataSources:
      - kind: ethereum/contract
        name: HoneyPause
        network: localhost
        source:
          abi: HoneyPause
          address: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
        mapping:
          kind: ethereum/events
          apiVersion: 0.0.6
          language: wasm/assemblyscript
          abis:
            - name: HoneyPause
              file: ./abis/localhost_HoneyPause.json
          entities:
            - Pot
            - Verifier
            - Whitehat
            - Claim
            # ...
    ```
- Subgraph mapping functions: [mappings.ts](/packages/subgraph/src/mappings.ts), these functions are deployed to the local graph-node and translate ethereum chain data to the graphQL store.
    ```typescript
    export function handleCreated(event: Created): void {
        const verifierId = event.params.verifier.toHexString()
        let verifier = Verifier.load(verifierId)
        if (verifier == null) {
            verifier = new Verifier(verifierId)
            verifier.address = event.params.verifier
            verifier.createdAt = event.block.timestamp;
            verifier.sender = event.transaction.from
            verifier.save()
        }

        const bountyId = event.params.bountyId.toHexString()
        const bounty = new Bounty(bountyId)
        bounty.name = event.params.name
        bounty.payoutToken = event.params.payoutToken
        bounty.payoutAmount = event.params.payoutAmount
        bounty.createdAt = event.block.timestamp
        // ...
    ```
- Subgraph GraphQL schema: [schema.graphql](/packages/subgraph/src/schema.graphql). The data types and structures your subgraph will produce.
    ```GraphQL
    type Bounty @entity {
        id: ID!
        name: String!
        payoutToken: Token!
        payoutAmount: BigInt!
        verifier: Verifier!
        createdAt: BigInt!
        sender: Bytes!
        claimed: Boolean!
        claim: Claim
        claimedAt: BigInt
        claimedWhitehat: Whitehat
    }

    type Verifier @entity(immutable: true) {
        id: ID!
        address: Bytes!
        createdAt: BigInt!
        sender: Bytes!
        bounties: [Bounty!]! @derivedFrom(field: "verifier")
    }

    type Token @entity(immutable: true) {
        id: ID!
        # ...
    ```

