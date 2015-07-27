var sphereWASHGuidelines = [
  // @Hygeine promotion standard 2, note 1
  {
    temporal: QEpiKit.Utils.always,
    condition: {
      label: "water transport container for all house holds",
      data: campEnv.resources.waterTransportContainers,
      key: "amount",
      value: campEnv.householdCount,
      check: QEpiKit.Utils.gtEq
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      label: "water storage container for all house holds",
      data: campEnv.resources.waterStorageContainers,
      key: "amount",
      value: campEnv.householdCount,
      check: QEpiKit.Utils.gtEq
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      label: "bathing soap for each person each month",
      data: campEnv.resources.bathingSoap,
      key: "amount",
      value: campEnv.householdCount,
      check: QEpiKit.Utils.gtEq
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      label: "laundry soap for each person each month",
      data: campEnv.resources.laundrySoap,
      key: "amount",
      value: campEnv.householdCount,
      check: QEpiKit.Utils.gtEq
    }
  },
  // @Water Supply Standard 1
  {
    temporal: QEpiKit.Utils.always,
    condition: {
      label: "each person has 15 litres of water total, per day",
      data: campEnv.resources.totalWater,
      key: "amount",
      value: campAgents.length * 15,
      check: QEpiKit.Utils.gtEq
    }
  }, { //@Water Supply Standard 1, Guidance Note  5
    temporal: QEpiKit.Utils.always,
    condition: {
      label: "enough water taps (pop / 250)",
      data: campEnv.resources.waterTaps,
      key: "amount",
      value: Math.ceil(campAgents.length / 250),
      check: QEpiKit.Utils.gtEq
    }
  }
];

var sphereAgentIndicators = {
  "dehydrated": {
    key: "dailyWater",
    value: 2.5,
    check: QEpiKit.Utils.gt
  }
};
