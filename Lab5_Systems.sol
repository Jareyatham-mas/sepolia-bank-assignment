// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title Lab 5 - Monthly subscription, rental, and product pre-order examples

contract MonthlySubscription {
    address public owner;
    uint256 public monthlyFeeWei;
    mapping(address => uint256) public paidThrough;

    error OnlyOwner();
    error IncorrectFee();

    constructor(uint256 initialMonthlyFeeWei) {
        owner = msg.sender;
        monthlyFeeWei = initialMonthlyFeeWei;
    }

    function setMonthlyFee(uint256 newFeeWei) external {
        if (msg.sender != owner) revert OnlyOwner();
        monthlyFeeWei = newFeeWei;
    }

    function payMonthly() external payable {
        if (msg.value != monthlyFeeWei) revert IncorrectFee();
        uint256 start = paidThrough[msg.sender] > block.timestamp
            ? paidThrough[msg.sender]
            : block.timestamp;
        paidThrough[msg.sender] = start + 30 days;
    }

    function isActive(address account) external view returns (bool) {
        return paidThrough[account] >= block.timestamp && paidThrough[account] != 0;
    }
}

contract RentalSystem {
    address public owner;
    uint256 public rentalFeeWei;
    mapping(address => bool) public hasPaid;

    error OnlyOwner();
    error IncorrectFee();

    constructor(uint256 initialRentalFeeWei) {
        owner = msg.sender;
        rentalFeeWei = initialRentalFeeWei;
    }

    function setRentalFee(uint256 newFeeWei) external {
        if (msg.sender != owner) revert OnlyOwner();
        rentalFeeWei = newFeeWei;
    }

    function rent() external payable {
        if (msg.value != rentalFeeWei) revert IncorrectFee();
        hasPaid[msg.sender] = true;
    }
}

contract ProductPreOrder {
    address public owner;
    uint256 public productPriceWei;
    uint256 public totalPreOrders;
    mapping(address => uint256) public preOrdersByBuyer;

    error OnlyOwner();
    error IncorrectPrice();

    constructor(uint256 initialProductPriceWei) {
        owner = msg.sender;
        productPriceWei = initialProductPriceWei;
    }

    function setProductPrice(uint256 newPriceWei) external {
        if (msg.sender != owner) revert OnlyOwner();
        productPriceWei = newPriceWei;
    }

    function preOrder() external payable {
        if (msg.value != productPriceWei) revert IncorrectPrice();
        preOrdersByBuyer[msg.sender] += 1;
        totalPreOrders += 1;
    }

    function myPreOrderCount() external view returns (uint256) {
        return preOrdersByBuyer[msg.sender];
    }
}
