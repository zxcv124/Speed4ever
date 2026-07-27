const { createHandler } = require('./_handler');
const { placeBid } = require('./_auctionService');

module.exports = createHandler(placeBid);
