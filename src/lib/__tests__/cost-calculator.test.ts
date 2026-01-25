import { describe, expect, it, afterEach } from "vitest";
import {
  calculatePlatformFee,
  calculateTotalCost,
  getFigurineCost,
} from "../cost-calculator";
import { fromAtomicUnits, toAtomicUnits } from "../plasma-config";

describe("cost-calculator", () => {
  afterEach(() => {
    delete process.env.FIGURINE_PRICE;
  });

  it("calculates platform fee with default bps", () => {
    const amount = 5000000n;
    const fee = calculatePlatformFee(amount);
    expect(fee).toBe(5000n);
  });

  it("calculates total cost consistently", () => {
    const breakdown = calculateTotalCost();

    expect(breakdown.totalCost).toBe(
      breakdown.geminiApiCost + breakdown.gasFeeBuffer + breakdown.platformFee
    );
    expect(breakdown.totalCostUSD).toBe(fromAtomicUnits(breakdown.totalCost));
  });

  it("uses environment price when provided", () => {
    process.env.FIGURINE_PRICE = "1.234500";
    expect(getFigurineCost()).toBe(toAtomicUnits("1.234500"));
  });
});
