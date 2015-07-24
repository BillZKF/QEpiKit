var sphereWASHGuidelines = [
  // @Hygeine promotion standard 2, note 1
  {
    temporal: QEpiKit.Utils.always,
    condition: {
      data: campEnv.resources.waterTransportContainers,
      key: "count",
      value: campEnv.householdCount,
      check: QEpiKit.Utils.gt
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      data: campEnv.resources.waterStorageContainers,
      key: "count",
      value: campEnv.householdCount,
      check: QEpiKit.Utils.gt
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      data: campEnv.resources.bathingSoap,
      key: "count",
      value: campEnv.householdCount,
      check: QEpiKit.Utils.gt
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      data: campEnv.resources.laundrySoap,
      key: "count",
      value: campEnv.householdCount,
      check: QEpiKit.Utils.gt
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      data: campEnv.resources.menstrualHygeineCotton,
      key: "count",
      value: campEnv.girls8AndUpCount,
      check: QEpiKit.Utils.gt
    }
  },
  // @Water Supply Standard 1
  {
    temporal: QEpiKit.Utils.always,
    condition: {
      data: campEnv.resources.totalWater,
      key: "quantity",
      value: campEnv.totalPop * 15,
      check: QEpiKit.Utils.gt
    }
  }, { //@Water Supply Standard 1, Guidance Note  5
    temporal: QEpiKit.Utils.always,
    condition: {
      data: campEnv.resources.waterTaps,
      key: "count",
      value: Math.ceil(campEnv.totalPop / 250),
      check: QEpiKit.Utils.gt
    }
  }
];

var sphereAgentIndicators = {
  "dehydrated" : {
    key : "dailyWater",
    value : 2.5,
    check : QEpiKit.Utils.gt
  }
};
