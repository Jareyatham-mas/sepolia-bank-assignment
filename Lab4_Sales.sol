// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title Lab 4 - Employee sales bonus and daily item totals
contract SalesCalculator {
    /// @notice Returns the bonus rate in basis points: 5%, 10%, or 15%.
    function bonusRateBps(uint256 salesBaht) public pure returns (uint256) {
        if (salesBaht < 100_000) return 500;
        if (salesBaht <= 500_000) return 1_000;
        return 1_500;
    }

    /// @notice Calculates bonus in the same smallest unit as salesBaht.
    function calculateBonus(uint256 salesBaht) external pure returns (uint256) {
        return (salesBaht * bonusRateBps(salesBaht)) / 10_000;
    }

    /// @notice Sums the quantities sold during one day.
    function totalSales(uint256[] calldata quantities) external pure returns (uint256 total) {
        for (uint256 i = 0; i < quantities.length; i++) {
            total += quantities[i];
        }
    }
}
