import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { useCallback } from "react";


type toBigType = (v?: string) => bigint;

type sumSuiDeltaForType = (
  bcs: SuiTransactionBlockResponse["balanceChanges"] | undefined,
  ownerAddress: string,
  coinType: string
) => bigint;

type getRecipientAddressType = (
  tx: SuiTransactionBlockResponse,
  senderAddress: string,
  coinType: string
) => string;

type gasFeeMistType = (tx: SuiTransactionBlockResponse) => bigint;

export const useQueryTxHelpers = () => {

// === Activity helpers (amount, gas, sender/recipient) ===
  const toBig = useCallback<toBigType>((v?: string) => (v ? BigInt(v) : 0n), []);

  // Sum SUI delta for THIS address only, so sent is negative and received is positive
  const sumSuiDeltaFor = useCallback<sumSuiDeltaForType>((
    bcs: SuiTransactionBlockResponse["balanceChanges"] | undefined,
    ownerAddress: string,
    coinType: string
  ) => {
    const list = (bcs ?? []).filter(
      (bc) =>
        bc.coinType &&
        bc.coinType.endsWith(coinType) &&
        (bc as any).owner?.AddressOwner === ownerAddress
    );
    return list.reduce((acc, bc) => acc + toBig(bc.amount), 0n);
  }, [toBig]);

  // fee = computationCost + storageCost - storageRebate (values are strings)
  const gasFeeMist = useCallback<gasFeeMistType>((tx: SuiTransactionBlockResponse) => {
    const g = tx.effects?.gasUsed;
    if (!g) return 0n;
    return toBig(g.computationCost) + toBig(g.storageCost) - toBig(g.storageRebate);
  }, [toBig]);

  // Find counterparty address for a sent tx (someone who gets positive SUI and is not you)
  const getRecipientAddress = useCallback<getRecipientAddressType>((
    tx: SuiTransactionBlockResponse,
    senderAddress: string,
    coinType: string
    ) => {
    const pos = (tx.balanceChanges ?? []).find(
      (bc) =>
        bc.coinType?.endsWith(coinType) &&
        toBig(bc.amount) > 0n &&
        (bc as any).owner?.AddressOwner &&
        (bc as any).owner?.AddressOwner !== senderAddress
    ) as any;
    if (pos?.owner?.AddressOwner) return pos.owner.AddressOwner;

    const createdOwner = tx.effects?.created?.find(
      (c: any) => c?.owner?.AddressOwner && c.owner.AddressOwner !== senderAddress
    ) as any;
    if (createdOwner?.owner?.AddressOwner) return createdOwner.owner.AddressOwner;

    return "Unknown";
  }, [toBig]);

  return {
    toBig,
    sumSuiDeltaFor,
    gasFeeMist,
    getRecipientAddress,
  };
};