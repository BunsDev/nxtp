// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

interface IWrapped {
  function deposit() external payable;

  function withdraw(uint256 amount) external;
}