import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { useCallback } from "react";
import { IotaTransactionBlockResponse } from "@iota/iota-sdk/client";

type toBigType = (v?: string) => bigint;

type sumDeltaForType = (
  bcs: SuiTransactionBlockResponse["balanceChanges"] | IotaTransactionBlockResponse["balanceChanges"] | undefined,
  ownerAddress: string,
  coinType: string
) => bigint;

type getRecipientAddressType = (
  tx: SuiTransactionBlockResponse | IotaTransactionBlockResponse,
  senderAddress: string,
  coinType: string
) => string;

type gasFeeMistType = (tx: SuiTransactionBlockResponse | IotaTransactionBlockResponse) => bigint;

export const useQueryTxHelpers = () => {

// === Activity helpers (amount, gas, sender/recipient) ===
  const toBig = useCallback<toBigType>((v?: string) => (v ? BigInt(v) : 0n), []);

  // Sum SUI delta for THIS address only, so sent is negative and received is positive
  const sumDeltaFor = useCallback<sumDeltaForType>((
    bcs: SuiTransactionBlockResponse["balanceChanges"] | IotaTransactionBlockResponse["balanceChanges"] | undefined,
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
  const gasFeeCal = useCallback<gasFeeMistType>((tx: SuiTransactionBlockResponse | IotaTransactionBlockResponse) => {
    const g = tx.effects?.gasUsed;
    if (!g) return 0n;
    return toBig(g.computationCost) + toBig(g.storageCost) - toBig(g.storageRebate);
  }, [toBig]);

  // Find counterparty address for a sent tx (someone who gets positive SUI and is not you)
  const getRecipientAddress = useCallback<getRecipientAddressType>((
    tx: SuiTransactionBlockResponse | IotaTransactionBlockResponse,
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
    sumDeltaFor,
    gasFeeCal,
    getRecipientAddress,
  };
};