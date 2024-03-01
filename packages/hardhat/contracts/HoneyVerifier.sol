// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "hardhat/console.sol";

import { IPauser, IVerifier, IPayer } from "./HoneyPause.sol";


error OnlyProtocolOperatorError();
error InvalidOperatorError();
error ExploitFailedError(bytes innerError);
error ExploitSucceededError();

event OperatorChanged(address oldOperator, address newOperator);
event Created(string name, address operator, bool failAssert);

contract HoneyVerifier is IVerifier, IPayer {
    string public name = "Protocol verifier test";
    bool public paused = false;
    address public operator;
    bytes public stateData;
    bool public failAssert = false;

    constructor(address _operator, string memory _name, bool _failAssert) {
		operator = _operator;
        name = _name;
        failAssert = _failAssert;
        emit Created(_name, _operator ,_failAssert);
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
    
    function beforeExploit(bytes memory exploitData) external returns (bytes memory _stateData) {
        stateData = exploitData;
        _stateData = stateData;
        return _stateData;
    }
    
    function assertExploit(bytes memory exploitData, bytes memory _stateData) external {
        stateData = exploitData;
        if (failAssert) {
            _stateData = stateData;
            revert ExploitFailedError(_stateData);
        }
        revert ExploitSucceededError();
    }
   

    // should prob be onlyOperator()
    function payExploiter(ERC20 token, address payable to, uint256 amount) external {
        token.transfer(to, amount);
    }

}
