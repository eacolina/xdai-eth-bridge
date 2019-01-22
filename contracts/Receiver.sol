pragma solidity >=0.5.0 <0.6.0;

contract Receiver{
    event TxReceived(address indexed sender, string message);
    
    function receive(address _sender, string memory _message) public {
        emit TxReceived(_sender, _message);
    }
}