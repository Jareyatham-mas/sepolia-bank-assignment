// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Assignment 4: student scores linked to student wallet addresses.
contract StudentScores {
    address public immutable owner;

    struct Student {
        string name;
        uint256 score;
        bool exists;
    }

    mapping(address => Student) private students;

    event StudentRecorded(address indexed student, string name, uint256 score);

    error OnlyOwner();
    error ZeroStudentAddress();
    error StudentNotFound();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    function setStudent(address student, string calldata name, uint256 score) external onlyOwner {
        if (student == address(0)) revert ZeroStudentAddress();
        students[student] = Student({name: name, score: score, exists: true});
        emit StudentRecorded(student, name, score);
    }

    function getStudent(address student) external view returns (string memory name, uint256 score) {
        Student storage record = students[student];
        if (!record.exists) revert StudentNotFound();
        return (record.name, record.score);
    }

    function hasStudent(address student) external view returns (bool) {
        return students[student].exists;
    }
}

/// @notice Assignment 4: owner-managed product records using a struct and mapping.
contract ProductInventory {
    address public immutable owner;

    struct Product {
        string name;
        uint256 priceWei;
        uint256 quantity;
        bool exists;
    }

    mapping(uint256 => Product) private products;

    event ProductAdded(uint256 indexed productId, string name, uint256 priceWei, uint256 quantity);

    error OnlyOwner();
    error ProductAlreadyExists();
    error ProductNotFound();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    function addProduct(
        uint256 productId,
        string calldata name,
        uint256 priceWei,
        uint256 quantity
    ) external onlyOwner {
        if (products[productId].exists) revert ProductAlreadyExists();
        products[productId] = Product({
            name: name,
            priceWei: priceWei,
            quantity: quantity,
            exists: true
        });
        emit ProductAdded(productId, name, priceWei, quantity);
    }

    function getProduct(uint256 productId)
        external
        view
        returns (string memory name, uint256 priceWei, uint256 quantity)
    {
        Product storage product = products[productId];
        if (!product.exists) revert ProductNotFound();
        return (product.name, product.priceWei, product.quantity);
    }

    function productExists(uint256 productId) external view returns (bool) {
        return products[productId].exists;
    }
}

/// @notice Assignment 4: users buy concert tickets and can check their own count.
contract ConcertTickets {
    address public immutable owner;
    uint256 public ticketPriceWei;
    uint256 public ticketSupply;
    uint256 public ticketsSold;

    mapping(address => uint256) public ticketsByBuyer;

    event TicketConfigurationUpdated(uint256 priceWei, uint256 supply);
    event TicketsPurchased(address indexed buyer, uint256 quantity, uint256 totalPaidWei);

    error OnlyOwner();
    error InvalidConfiguration();
    error InvalidQuantity();
    error SoldOut();
    error IncorrectPayment();

    constructor(uint256 initialPriceWei, uint256 initialSupply) {
        owner = msg.sender;
        if (initialPriceWei == 0 || initialSupply == 0) revert InvalidConfiguration();
        ticketPriceWei = initialPriceWei;
        ticketSupply = initialSupply;
        emit TicketConfigurationUpdated(initialPriceWei, initialSupply);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    function setTicketConfiguration(uint256 priceWei, uint256 supply) external onlyOwner {
        if (priceWei == 0 || supply < ticketsSold) revert InvalidConfiguration();
        ticketPriceWei = priceWei;
        ticketSupply = supply;
        emit TicketConfigurationUpdated(priceWei, supply);
    }

    function buyTicket(uint256 quantity) external payable {
        if (quantity == 0) revert InvalidQuantity();
        if (quantity > ticketSupply - ticketsSold) revert SoldOut();
        if (msg.value != ticketPriceWei * quantity) revert IncorrectPayment();

        ticketsSold += quantity;
        ticketsByBuyer[msg.sender] += quantity;
        emit TicketsPurchased(msg.sender, quantity, msg.value);
    }

    function myTicketCount() external view returns (uint256) {
        return ticketsByBuyer[msg.sender];
    }

    function ticketsFor(address buyer) external view onlyOwner returns (uint256) {
        return ticketsByBuyer[buyer];
    }
}
