// Database configuration - tương ứng Database.java
export interface DatabaseConfig {
  id?: number;
  serverIP: string;
  apiName: string;
  dbIP: string;
  dbName: string;
  dbAlias: string;
  dbUsername: string;
  dbPassword: string;
  isVisible: boolean;
}

// User info
export interface User {
  userNo: string;
  userName: string;
  departmentNo: string;
  departmentName: string;
}

// Login request/response
export interface LoginRequest {
  username: string;
  password: string;
  dbIP: string;
  dbName: string;
  dbUsername: string;
  dbPassword: string;
}

export interface LoginResponse {
  status: string;
  user?: User;
  permissions?: string[];
  message?: string;
}

// Home info - từ getwipuserinfo API
export interface HomeInfo {
  employeeNo: string; // NO_EMP - mã nhân viên (hiển thị ở drawer)
  employeeName: string; // NAME_EMP - tên nhân viên (hiển thị ở home)
  departmentName: string; // NAME_DEP - tên bộ phận
  right719: boolean;
  right729: boolean;
  qty1Remain: number; // QTY_REMAIN_01
  qty2Remain: number; // QTY_REMAIN_02
  qty3Remain: number; // QTY_REMAIN_03
  qty4Remain: number; // QTY_REMAIN_04
  qtyInOut01: number; // QTY_IN_OUT_01
  qtyInOut02: number; // QTY_IN_OUT_02
  qtyInOut03: number; // QTY_IN_OUT_03
  qtyInOut04: number; // QTY_IN_OUT_04
}
