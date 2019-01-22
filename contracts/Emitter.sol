pragma solidity >=0.5.0 <0.6.0;

contract Emitter {
    event Updated(uint time, string message);
    string public curr_message;
    constructor(string memory message) public{
        updateMessage(message);
    }

    function updateMessage(string memory message) public{
        curr_message = message;
        emit Updated(now, message);
    }
}