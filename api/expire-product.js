const { createHandler } = require('./_handler');
const { finalizeAuction } = require('./_auctionService');

module.exports = createHandler(finalizeAuction);
