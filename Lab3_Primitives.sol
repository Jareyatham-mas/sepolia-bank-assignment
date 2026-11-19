// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title Lab 3 - Solidity primitive types and default values
/// @notice Demonstrates booleans, signed/unsigned integers, address, bytes1,
///         integer limits, and Solidity's zero-initialized state variables.
contract Primitives {
    bool public boo = true;

    uint8 public u8 = 1;
    uint256 public u256 = 456;
    uint256 public u = 123;

    int8 public i8 = -1;
    int256 public i256 = 456;
    int256 public i = -123;

    int256 public minInt = type(int256).min;
    int256 public maxInt = type(int256).max;
    uint256 public maxUint = type(uint256).max;

    address public addr;
    bytes1 public a = 0xb5;
    bytes1 public b = 0x56;

    // State variables without initializers use their type's default value.
    bool public defaultBool;
    uint256 public defaultUint;
    int256 public defaultInt;
    address public defaultAddr;
}
