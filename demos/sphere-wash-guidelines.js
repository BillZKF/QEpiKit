var sphereWASHGuidelines = [
  // @Hygeine promotion standard 2, note 1
  {
    temporal: QEpiKit.Utils.always,
    condition: {
      ref: campEnv.resources.waterTransportContainers,
      key: "count",
      value: campEnv.houselholdCount,
      check: QEpiKit.Utils.gt
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      ref: campEnv.resources.waterStorageContainers,
      key: "count",
      value: campEnv.houselholdCount,
      check: QEpiKit.Utils.gt
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      ref: campEnv.resources.bathingSoap,
      key: "count",
      value: campEnv.houselholdCount,
      check: QEpiKit.Utils.gt
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      ref: campEnv.resources.laundrySoap,
      key: "count",
      value: campEnv.houselholdCount,
      check: QEpiKit.Utils.gt
    }
  }, {
    temporal: QEpiKit.Utils.always,
    condition: {
      ref: campEnv.resources.menstrualHygeineCotton,
      key: "count",
      value: campEnv.girls8AndUpCount,
      check: QEpiKit.Utils.gt
    }
  },
  // @Water Supply Standard 1
  {
    temporal: QEpiKit.Utils.always,
    condition: {
      ref: campEnv.resources.totalWater,
      key: "quantity",
      value: campEnv.totalPop * 15,
      check: QEpiKit.Utils.gt
    }
  }, { //@Water Supply Standard 1, Guidance Note  5
    temporal: QEpiKit.Utils.always,
    condition: {
      ref: campEnv.resources.waterTaps,
      key: "count",
      value: Math.ceil(campEnv.totalPop / 250),
      check: QEpiKit.Utils.gt
    }
  }
];
