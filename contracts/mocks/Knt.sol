pragma solidity 0.6.3;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Knt is ERC20 {
    
    constructor() ERC20('KNT', 'Knnlrts token') public {}
        
    function faucet(address to, uint amount) external {
        _mint(to, amount);
    }
}