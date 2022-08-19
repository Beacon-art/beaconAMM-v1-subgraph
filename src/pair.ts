import { AssetRecipientChange, DeltaUpdate, FeeUpdate, OwnershipTransferred, SpotPriceUpdate, SwapNFTInPair, SwapNFTOutPair, TokenDeposit, TokenWithdrawal } from "../generated/templates/LSSVMPair/LSSVMPair"
import { Collection, Pair, PairOwner } from "../generated/schema"
import { Multicall3 } from "../generated/templates/LSSVMPair/Multicall3"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
    let pair = Pair.load(event.address.toHex())

    let pairOwner = PairOwner.load(event.params.newOwner.toHex())
    if (pairOwner === null) {
        pairOwner = new PairOwner(event.params.newOwner.toHex())
    }

    pair!.owner = pairOwner.id

    pair!.save()
    pairOwner.save()
}

export function handleAssetRecipientChange(event: AssetRecipientChange): void {
    let pair = Pair.load(event.address.toHex())
    pair!.assetRecipient = event.params.a.toHex()
    pair!.save()
}

export function handleDeltaUpdate(event: DeltaUpdate): void {
    let pair = Pair.load(event.address.toHex())
    pair!.delta = event.params.newDelta
    pair!.save()
}

export function handleFeeUpdate(event: FeeUpdate): void {
    let pair = Pair.load(event.address.toHex())
    pair!.fee = event.params.newFee
    pair!.save()
}

export function handleSpotPriceUpdate(event: SpotPriceUpdate): void {
    let pair = Pair.load(event.address.toHex())
    pair!.spotPrice = event.params.newSpotPrice
    pair!.save()
}

export function handleTokenDeposit(event: TokenDeposit): void {
    handleEthBalanceUpdate(event)
}

export function handleTokenWithdrawal(event: TokenWithdrawal): void {
    handleEthBalanceUpdate(event)
}

export function handleSwapNFTInPair(event: SwapNFTInPair): void {
    let pair = Pair.load(event.address.toHex())
    let collection = Collection.load(pair!.collection)
    let ethChange = handleEthBalanceUpdate(event)
    collection!.ethVolume = collection!.ethVolume.plus(ethChange.abs())
    collection!.save()
}

export function handleSwapNFTOutPair(event: SwapNFTOutPair): void {
    let pair = Pair.load(event.address.toHex())
    let collection = Collection.load(pair!.collection)
    let ethChange = handleEthBalanceUpdate(event)
    collection!.ethVolume = collection!.ethVolume.plus(ethChange.abs())
    collection!.save()
}

function handleEthBalanceUpdate(event: ethereum.Event): BigInt {
    let multicall3 = Multicall3.bind(Address.fromString("0xcA11bde05977b3631167028862bE2a173976CA11"))
    let pair = Pair.load(event.address.toHex())
    let ethChange = multicall3.getEthBalance(event.address).minus(pair!.ethBalance) // positive when ETH goes into the pair, negative when ETH goes out of the pair
    pair!.ethBalance = pair!.ethBalance.plus(ethChange)
    pair!.save()

    if (shouldCountPairOfferTVL(pair!)) {
        let collection = Collection.load(pair!.collection)
        collection!.ethOfferTVL = collection!.ethOfferTVL.plus(ethChange)
        collection!.save()
    }

    return ethChange
}

function shouldCountPairOfferTVL(pair: Pair): bool {
    // is TOKEN or TRADE pair
    return pair.type.equals(BigInt.zero()) || pair.type.equals(BigInt.fromI32(2))
}