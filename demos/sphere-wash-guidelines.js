var sphereWASHGuidelines = [
  // @Hygeine promotion standard 2, note 1
  {
    temporal: QEpiKit.Utils.always,
    condition: {
      label: "Hygeine promotion standard 2, note 1: Water transport container for all house holds",
      data: campEnv.resources.waterTransportContainers,
      key: "amount",
      value: campEnv.householdCount,
      check: QEpiKit.Utils.gtEq
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      label: "Hygeine promotion standard 2, note 1: Water storage container for all house holds",
      data: campEnv.resources.waterStorageContainers,
      key: "amount",
      value: campEnv.householdCount,
      check: QEpiKit.Utils.gtEq
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      label: "Hygeine promotion standard 2, note 1: Bathing soap for each person each month",
      data: campEnv.resources.bathingSoap,
      key: "amount",
      value: campEnv.householdCount,
      check: QEpiKit.Utils.gtEq
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      label: "Hygeine promotion standard 2, note 1: Laundry soap for each person each month",
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
      label: "Water Supply Standard 1: Each person has 15 litres of water total, per day",
      data: campEnv.resources.totalWater,
      key: "amount",
      value: campAgents.length * 15,
      check: QEpiKit.Utils.gtEq
    }
  }, { //@Water Supply Standard 1, Guidance Note  5
    temporal: QEpiKit.Utils.always,
    condition: {
      label: "Water Supply Standard 1, Guidance Note  5: Enough water taps (pop / 250)",
      data: campEnv.resources.waterTaps,
      key: "amount",
      value: Math.ceil(campAgents.length / 250),
      check: QEpiKit.Utils.gtEq
    }
  }
];
