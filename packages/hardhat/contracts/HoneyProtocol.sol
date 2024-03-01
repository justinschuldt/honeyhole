// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "hardhat/console.sol";

import { IPauser } from "./HoneyPause.sol";

error OnlyProtocolOperatorError();
error InvalidOperatorError();
error InvalidPauseError();
error InvalidUnpauseError();

event OperatorChanged(address oldOperator, address newOperator);
event Created(string name, address operator);
event Paused();
event Unpaused();


contract HoneyProtocol is IPauser {
    string public name = "Protocol with pause";
    bool public paused = false;
    address public operator;

    constructor(address _operator, string memory _name) {
		operator = _operator;
        name = _name;
        emit Created(_name, _operator);
	}


    modifier onlyOperator() {
        if (msg.sender != operator) {
            revert OnlyProtocolOperatorError();
        }
        _; 
    }

    function replaceOperator(address newOperator)
        external onlyOperator()
    {
        if (newOperator == address(0)) {
            revert InvalidOperatorError();
        }
        operator = newOperator;
        emit OperatorChanged(msg.sender, newOperator);
    }

    // should prob be onlyOperator()
    function pause() external {
        if (paused == true) {
            revert InvalidPauseError();
        }
        paused = true;
        emit Paused();
    }
    // should prob be onlyOperator()
    function unpause() external onlyOperator() {
        if (paused == false) {
            revert InvalidUnpauseError();
        }
        paused = false;
        emit Unpaused();
    }

}
