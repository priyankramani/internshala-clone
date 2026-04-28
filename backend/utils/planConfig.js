const plans = {
  BRONZE: {
    price: 100,
    limit: 3,
  },
  SILVER: {
    price: 300,
    limit: 5,
  },
  GOLD: {
    price: 1000,
    limit: -1, // unlimited
  },
};

module.exports = plans;
