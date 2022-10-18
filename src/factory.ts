import {
  CreatePairETHCall
} from "../generated/BeaconAmmV1PairFactory/BeaconAmmV1PairFactory"
import { Pair, Collection, PairOwner } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { BeaconAmmV1Pair as PairTemplate, ERC721 as ERC721Template } from "../generated/templates"

export function handleNewPair(call: CreatePairETHCall): void {
  let pair = new Pair(call.outputs.pair.toHex())

  let ownerAddress = call.from
  let pairOwner = PairOwner.load(ownerAddress.toHex())
  if (pairOwner === null) {
    pairOwner = new PairOwner(ownerAddress.toHex())
  }

  let collectionAddress = call.inputs._nft
  let collection = Collection.load(collectionAddress.toHex())
  let isNewCollection = collection === null
  if (collection === null) {
    collection = new Collection(collectionAddress.toHex())
    collection.ethOfferTVL = BigInt.zero()
    collection.ethVolume = BigInt.zero()
    collection.royaltyFeeEarnings = BigInt.zero()
  }

  pair.owner = pairOwner.id
  pair.collection = collection.id
  pair.type = BigInt.fromI32(call.inputs._poolType)
  pair.assetRecipient = call.inputs._assetRecipient.toHex()
  pair.bondingCurve = call.inputs._bondingCurve.toHex()
  pair.delta = call.inputs._delta
  pair.fee = call.inputs._fee
  pair.spotPrice = call.inputs._spotPrice
  let initialNFTIDs = call.inputs._initialNFTIDs
  initialNFTIDs.sort()
  pair.nftIds = initialNFTIDs
  pair.numNfts = BigInt.fromI32(call.inputs._initialNFTIDs.length)
  pair.ethBalance = BigInt.zero()
  pair.ethVolume = BigInt.zero()
  pair.tradeFeeEarnings = BigInt.zero()

  pair.save()
  pairOwner.save()
  collection.save()

  PairTemplate.create(call.outputs.pair)
  if (isNewCollection) {
    ERC721Template.create(collectionAddress)
  }
}
