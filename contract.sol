pragma solidity ^0.4.22;
import "github.com/provable-things/ethereum-api/provableAPI_0.4.25.sol";

contract HeMin_Test_Oracle is usingProvable {

    string public ETHUSD;
    
    event LogConstructorInitiated(string nextStep);
    event LogPriceUpdated(string price);
    event LogNewProvableQuery(string description);
    
    struct Item { 
       uint256 ts;
       string price;
       address sender;
    }
    Item[] public priceArray;
    uint256 public updateCount;
    mapping (bytes32 => bool) public pendingQueries;
    
    function HeMin_Test_Oracle() payable {
        LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Provable Query.");
        updateCount = 0;
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != provable_cbAddress()) revert();
        require (pendingQueries[myid] == true);
        ETHUSD = result;
        LogPriceUpdated(result);
        delete pendingQueries[myid]; // This effectively marks the query id as processed.
        priceArray.push(Item(now, result, msg.sender));
        updateCount = updateCount + 1;
    }

    function updatePrice() payable {
        if (provable_getPrice("URL") > this.balance) {
          LogNewProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee");
        } else {
          LogNewProvableQuery("Provable query was sent, standing by for the answer..");
          bytes32 queryId = provable_query("URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
          pendingQueries[queryId] = true;
        }
    }
}