import { BigInt, Address } from "@graphprotocol/graph-ts";
// import contract and events
import {
  HoneyPause,
  OperatorChanged,
  Created,
  Cancelled,
  Claimed,
  SandboxExploitCall
} from "../generated/HoneyPause/HoneyPause";
// import schema
import {
  Pot, Verifier, Pauser, Payer, Operator, Claim, Whitehat, Exploiter, SandboxExploit
} from "../generated/schema";


// event Created(uint256 potId, string name, ERC20 payoutToken, uint256 payoutAmount, IVerifier verifier);
export function handleCreated(event: Created): void {

  let verifierId = event.params.verifier.toHexString()
  let verifier = Verifier.load(verifierId)
  if (verifier == null) {
    verifier = new Verifier(verifierId)
    verifier.address = event.params.verifier
    verifier.createdAt = event.block.timestamp;
    verifier.sender = event.transaction.from
    verifier.save()
  }

  let pot = new Pot(event.params.potId.toString()) // might need to make this a string
  pot.name = event.params.name
  pot.payoutToken = event.params.payoutToken
  pot.payoutAmount = event.params.payoutAmount
  pot.verifier = verifierId
  pot.sender = event.transaction.from
  pot.createdAt = event.block.timestamp
  pot.claimed = false
  pot.claimedAt = BigInt.fromI32(0) // make this optional
  pot.cancelled = false
  pot.cancelledAt = BigInt.fromI32(0)

  pot.save()
}



// event Cancelled(uint256 potId);
export function handleCancelled(event: Cancelled): void {
  let id = event.params.potId.toString()
  let pot = Pot.load(id)
  if (pot == null) {
    return // ?
  }
  pot.cancelled = true
  pot.cancelledAt = event.block.timestamp
  pot.save() 
}

// event Claimed(uint256 indexed potId, ERC20 payoutToken, uint256 payoutAmount);
export function handleClaimed(event: Claimed): void {
  let id = event.params.potId.toString()
  let pot = Pot.load(id)
  if (pot == null) {
    return // ?
  }
  pot.claimed = true
  pot.claimedAt = event.block.timestamp
  // pot.claimedSender = event.transaction.from

  let whitehatId = event.transaction.from.toHex()
  let whitehat = Whitehat.load(whitehatId)
  if (whitehat == null) {
    whitehat = new Whitehat(whitehatId)
    whitehat.address = event.transaction.from
    whitehat.createdAt = event.block.timestamp
    whitehat.save()
  }

  pot.claimedWhitehat = whitehatId

  let claimId = event.transaction.from.toHex()
  let claim = Claim.load(claimId)
  if (claim == null) {
    claim = new Claim(claimId)
    claim.sender = event.transaction.from
    claim.transactionHash = event.transaction.hash.toHex()
    claim.createdAt = event.block.timestamp
    claim.potId = event.params.potId
    claim.payoutToken = event.params.payoutToken
    claim.payoutAmount = event.params.payoutAmount
    claim.whitehat = whitehatId
    claim.save()
  }
  let sandboxExploitId = event.transaction.hash.toHex()
  let sandboxExploit = SandboxExploit.load(sandboxExploitId)
  if (sandboxExploit != null) {

    sandboxExploit.potId = event.params.potId
    sandboxExploit.successful = true
    sandboxExploit.save()
  }
  pot.save()
}

// export function handleSandboxExploit(call: SandboxExploitCall): void {
//   let whitehatId = call.from.toHex()
//   let whitehat = Whitehat.load(whitehatId)
//   if (whitehat == null) {
//     whitehat = new Whitehat(whitehatId)
//     whitehat.address = call.from
//     whitehat.createdAt = call.block.timestamp
//     whitehat.save()

//   }
//   let explioterId = call.inputs.exploiter.toHex()
//   let explioter = Exploiter.load(explioterId)
//   if (explioter == null) {
//     explioter = new Exploiter(explioterId)
//     explioter.address = call.inputs.exploiter
//     explioter.createdAt = call.block.timestamp
//     explioter.exploitData = call.inputs.exploitData
//     explioter.save()
//   }

//   let id = call.transaction.hash.toHex()
//   let sandboxExploit = new SandboxExploit(id)
//   sandboxExploit.whitehat = whitehatId
//   sandboxExploit.exploiter = call.inputs.exploiter.toHex()
//   sandboxExploit.verifier = call.inputs.verifier.toHex()
//   sandboxExploit.exploitData = call.inputs.exploitData
//   sandboxExploit.save()
// }
