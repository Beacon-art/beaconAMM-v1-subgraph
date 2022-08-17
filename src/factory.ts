import {
  NewPair,
} from "../generated/LSSVMFactory/LSSVMFactory"
import { LSSVMPair } from "../generated/templates/LSSVMPair/LSSVMPair"
import { Pair, Collection, PairOwner } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { LSSVMPair as PairTemplate, ERC721 as ERC721Template } from "../generated/templates"

export function handleNewPair(event: NewPair): void {
  let pair = new Pair(event.params.poolAddress.toHex())
  let pairContract = LSSVMPair.bind(event.params.poolAddress)

  let ownerAddress = pairContract.owner();
  let pairOwner = PairOwner.load(ownerAddress.toHex())
  if (pairOwner === null) {
    pairOwner = new PairOwner(ownerAddress.toHex())
  }

  let collectionAddress = pairContract.nft()
  let collection = Collection.load(collectionAddress.toHex())
  let isNewCollection = collection === null
  if (collection === null) {
    collection = new Collection(collectionAddress.toHex())
  }

  pair.owner = pairOwner.id
  pair.collection = collection.id
  pair.type = BigInt.fromI32(pairContract.poolType())
  pair.assetRecipient = pairContract.assetRecipient().toHex()
  pair.bondingCurve = pairContract.bondingCurve().toHex()
  pair.delta = pairContract.delta()
  pair.fee = pairContract.fee()
  pair.spotPrice = pairContract.spotPrice()
  pair.nftIds = new Array<BigInt>()
  pair.numNfts = BigInt.zero()

  pair.save()
  pairOwner.save()
  collection.save()

  PairTemplate.create(event.params.poolAddress)
  if (isNewCollection) {
    ERC721Template.create(collectionAddress)
  }
}
