import { describe, expect, it } from "vitest";
import {
  PLASMA_CONFIG,
  calculateProtocolFee,
  fromAtomicUnits,
  toAtomicUnits,
} from "../plasma-config";

describe("plasma-config", () => {
  it("converts to and from atomic units", () => {
    expect(toAtomicUnits("1")).toBe(1000000n);
    expect(toAtomicUnits("1.234567")).toBe(1234567n);
    expect(toAtomicUnits("0.000001")).toBe(1n);

    expect(fromAtomicUnits(1n)).toBe("0.000001");
    expect(fromAtomicUnits(1000000n)).toBe("1.000000");
  });

  it("calculates protocol fee using configured bps", () => {
    const amount = 1000000n;
    const { feeAmount, totalAmount } = calculateProtocolFee(amount);

    expect(feeAmount).toBe((amount * BigInt(PLASMA_CONFIG.PLATFORM_FEE_BPS)) / 10000n);
    expect(totalAmount).toBe(amount + feeAmount);
  });
});
