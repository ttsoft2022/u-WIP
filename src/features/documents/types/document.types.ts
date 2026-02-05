// Document Master - matches API response from getwipdoclist
export interface DocMaster {
  NO_LOT: string;
  NO_ORD: string;
  NO_ORD_712: string;
  NO_STY: string;
  NO_DEP_FROM: string;
  NAME_DEP_FROM: string;
  NO_DEP_TO: string;
  NAME_DEP_TO: string;
  NO_PRD: string;
  NAME_PRD: string;
  QTY: number;
}

// Document Detail - matches API response from getwipdocdetail
export interface DocDetail {
  NO_SIZ: string;
  NO_COL: string;
  NAME_COL: string;
  QTY_REMAIN: number;
  QTY_IN_OUT: number;
}

// Document list request params
export interface DocListParams {
  docType: string;
  fromDate?: string;
  toDate?: string;
}

// Document detail request params
export interface DocDetailParams {
  noLot: string;
  noOrd: string;
  docType: string;
}
