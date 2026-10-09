export type StatusState = "Active" | "Pending" | "Discharge";

export interface Patient {
  initials: string;
  name: string;
  mrn: string;
  planOfCare: string;
  admissionDate: string;
  status: StatusState;
  gender?: string;
  dob?: string;
  weight?: string;
  height?: string;
  ethnicity?: string;
}

export interface Device {
  name: string;
  serial: string;
  /** Mock scan: ms after the scan starts that this device is discovered. */
  foundAfter: number;
}

export interface TestType {
  id: string;
  label: string;
  desc: string;
}

export interface Answers {
  gender:    string;
  dob:       string;
  weight:    string;
  heightFt:  string;
  heightIn:  string;
  ethnicity: string;
}

export const PATIENTS: Patient[] = [
  {
    initials: "MJ",
    name: "Michael M. Jonathan",
    mrn: "MRN-02011",
    planOfCare: "PT | EMR Synced: Y",
    admissionDate: "2024-11-01",
    status: "Active",
    gender: "Male",
    dob: "03/15/1980",
    weight: "142",
    height: "5'6\"",
    ethnicity: "White / Caucasian",
  },
  {
    initials: "MW",
    name: "Michelle A. Worthey",
    mrn: "MRN-02012",
    planOfCare: "PT | EMR Synced: Y",
    admissionDate: "2024-11-01",
    status: "Active",
    gender: "Female",
    dob: "07/22/1974",
    weight: "151",
    height: "5'5\"",
    ethnicity: "Black or African American",
  },
  {
    initials: "MA",
    name: "Michael Anderson",
    mrn: "MRN-02013",
    planOfCare: "OT | EMR Synced: Y",
    admissionDate: "2024-11-01",
    status: "Active",
    gender: "Male",
    dob: "12/02/1961",
    weight: "188",
    height: "5'11\"",
    ethnicity: "",
  },
  {
    initials: "MB",
    name: "Michelle Bennett",
    mrn: "MRN-02014",
    planOfCare: "PT | EMR Synced: N",
    admissionDate: "2024-11-01",
    status: "Active",
    gender: "Female",
    dob: "05/09/1989",
    weight: "",
    height: "5'4\"",
    ethnicity: "Hispanic or Latino",
  },
  {
    initials: "AM",
    name: "Alice Martinez",
    mrn: "MRN-00101",
    planOfCare: "PT | EMR Synced: Y",
    admissionDate: "2024-05-10",
    status: "Active",
    gender: "Female",
    dob: "04/12/1968",
    weight: "138",
    height: "5'4\"",
    ethnicity: "Hispanic or Latino",
  },
  {
    initials: "BT",
    name: "Barry Thomson",
    mrn: "MRN-00412",
    planOfCare: "PT | EMR Synced: Y",
    admissionDate: "2024-03-12",
    status: "Active",
    gender: "Male",
    dob: "11/28/1975",
    weight: "",
    height: "5'11\"",
    ethnicity: "White / Caucasian",
  },
  {
    initials: "CR",
    name: "Carlos Rivera",
    mrn: "MRN-00203",
    planOfCare: "OT | EMR Synced: Y",
    admissionDate: "2024-06-01",
    status: "Active",
    gender: "Male",
    dob: "02/18/1955",
    weight: "190",
    height: "5'9\"",
    ethnicity: "Hispanic or Latino",
  },
  {
    initials: "DK",
    name: "Dev Kyle",
    mrn: "MRN-00577",
    planOfCare: "PT | EMR Synced: Y",
    admissionDate: "2024-04-01",
    status: "Discharge",
    gender: "Male",
    dob: "07/04/1990",
    weight: "175",
    height: "6'0\"",
    ethnicity: "Asian",
  },
  {
    initials: "EJ",
    name: "Eleanor James",
    mrn: "MRN-00315",
    planOfCare: "ST | EMR Synced: Y",
    admissionDate: "2024-07-15",
    status: "Pending",
    gender: "Female",
    dob: "09/30/1972",
    weight: "155",
    height: "5'7\"",
    ethnicity: "Black or African American",
  },
  {
    initials: "FN",
    name: "Franklin Nguyen",
    mrn: "MRN-00489",
    planOfCare: "PT | EMR Synced: N",
    admissionDate: "2023-12-05",
    status: "Pending",
    gender: "Male",
    dob: "05/22/1963",
    weight: "168",
    height: "5'8\"",
    ethnicity: "Asian",
  },
  {
    initials: "GH",
    name: "Grace Hoffman",
    mrn: "MRN-00621",
    planOfCare: "OT | EMR Synced: Y",
    admissionDate: "2024-01-20",
    status: "Active",
    gender: "Female",
    dob: "11/05/1988",
    weight: "130",
    height: "5'5\"",
    ethnicity: "White / Caucasian",
  },
  {
    initials: "HB",
    name: "Henry Brooks",
    mrn: "MRN-00734",
    planOfCare: "PT | EMR Synced: Y",
    admissionDate: "2024-08-03",
    status: "Active",
    gender: "Male",
    dob: "03/14/1945",
    weight: "160",
    height: "5'10\"",
    ethnicity: "White / Caucasian",
  },
  {
    initials: "IC",
    name: "Isabel Chen",
    mrn: "MRN-00845",
    planOfCare: "ST | EMR Synced: Y",
    admissionDate: "2024-02-28",
    status: "Active",
    gender: "Female",
    dob: "07/19/1993",
    weight: "118",
    height: "5'3\"",
    ethnicity: "Asian",
  },
  {
    initials: "JD",
    name: "James Donovan",
    mrn: "MRN-00956",
    planOfCare: "PT | EMR Synced: Y",
    admissionDate: "2024-09-12",
    status: "Active",
    gender: "Male",
    dob: "12/01/1958",
    weight: "200",
    height: "6'1\"",
    ethnicity: "White / Caucasian",
  },
  {
    initials: "KW",
    name: "Kate Wilson",
    mrn: "MRN-00289",
    planOfCare: "PT | EMR Synced: Y",
    admissionDate: "2024-02-20",
    status: "Active",
    gender: "Female",
    dob: "03/15/1980",
    weight: "142",
    height: "5'6\"",
    ethnicity: "Hispanic or Latino",
  },
  {
    initials: "LM",
    name: "Lena Murphy",
    mrn: "MRN-01067",
    planOfCare: "OT | EMR Synced: Y",
    admissionDate: "2024-10-01",
    status: "Active",
    gender: "Female",
    dob: "08/23/1976",
    weight: "148",
    height: "5'6\"",
    ethnicity: "White / Caucasian",
  },
  {
    initials: "MO",
    name: "Marcus Owens",
    mrn: "MRN-01178",
    planOfCare: "PT | EMR Synced: N",
    admissionDate: "2024-04-18",
    status: "Pending",
    gender: "Male",
    dob: "01/09/1983",
    weight: "182",
    height: "5'11\"",
    ethnicity: "Black or African American",
  },
  {
    initials: "NP",
    name: "Nina Patel",
    mrn: "MRN-01289",
    planOfCare: "ST | EMR Synced: Y",
    admissionDate: "2024-03-30",
    status: "Active",
    gender: "Female",
    dob: "06/14/1991",
    weight: "125",
    height: "5'4\"",
    ethnicity: "Asian",
  },
  {
    initials: "OR",
    name: "Oscar Reyes",
    mrn: "MRN-01390",
    planOfCare: "PT | EMR Synced: Y",
    admissionDate: "2023-11-10",
    status: "Discharge",
    gender: "Male",
    dob: "10/27/1970",
    weight: "195",
    height: "5'9\"",
    ethnicity: "Hispanic or Latino",
  },
  {
    initials: "PS",
    name: "Patricia Sullivan",
    mrn: "MRN-01401",
    planOfCare: "OT | EMR Synced: Y",
    admissionDate: "2024-07-05",
    status: "Active",
    gender: "Female",
    dob: "02/03/1952",
    weight: "145",
    height: "5'3\"",
    ethnicity: "White / Caucasian",
  },
  {
    initials: "RT",
    name: "Robert Tanaka",
    mrn: "MRN-01512",
    planOfCare: "PT | EMR Synced: Y",
    admissionDate: "2024-06-22",
    status: "Active",
    gender: "Male",
    dob: "04/08/1965",
    weight: "170",
    height: "5'7\"",
    ethnicity: "Asian",
  },
  {
    initials: "SL",
    name: "Sandra Lee",
    mrn: "MRN-01623",
    planOfCare: "ST | EMR Synced: Y",
    admissionDate: "2024-05-14",
    status: "Active",
    gender: "Female",
    dob: "09/17/1987",
    weight: "133",
    height: "5'5\"",
    ethnicity: "Asian",
  },
  {
    initials: "TW",
    name: "Thomas Walker",
    mrn: "MRN-01734",
    planOfCare: "PT | EMR Synced: Y",
    admissionDate: "2024-08-28",
    status: "Active",
    gender: "Male",
    dob: "07/30/1948",
    weight: "172",
    height: "5'9\"",
    ethnicity: "White / Caucasian",
  },
  {
    initials: "VG",
    name: "Valeria Garcia",
    mrn: "MRN-01845",
    planOfCare: "OT | EMR Synced: Y",
    admissionDate: "2024-09-08",
    status: "Active",
    gender: "Female",
    dob: "11/12/1979",
    weight: "136",
    height: "5'5\"",
    ethnicity: "Hispanic or Latino",
  },
];

export const DEVICES: Device[] = [
  { name: "SPIROBANK OXI",   serial: "SE-011-E010832", foundAfter: 1600 },
  { name: "SPIROBANK OXI",   serial: "SE-011-E010824", foundAfter: 2100 },
  { name: "SPIROBANK SMART", serial: "SM-009-Z117694", foundAfter: 2600 },
];

export const TEST_TYPES: TestType[] = [
  {
    id: "expiratory",
    label: "Expiratory Maneuver",
    desc: "It is a technique used to enhance lung function by forcefully exhaling air.",
  },
  {
    id: "exp_insp",
    label: "Expiratory/Inspiratory Maneuver",
    desc: "It uses controlled breathing techniques to enhance lung function and overall respiratory health.",
  },
];

export const ETHNICITIES = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Hispanic or Latino",
  "Native Hawaiian or Other Pacific Islander",
  "White / Caucasian",
  "Two or More Races",
  "Unknown / Not Reported",
  "Prefer not to say",
];

export function calcAge(dob: string): string {
  try {
    const [m, d, y] = dob.split("/").map(Number);
    if (!m || !d || !y) return "";
    const yrs = (Date.now() - new Date(y, m - 1, d).getTime()) / (365.25 * 864e5);
    if (yrs <= 0 || yrs > 120) return "";
    return yrs.toFixed(1);
  } catch { return ""; }
}

/** "2024-11-01" → "11/01/2024" */
export function formatAdmission(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${m}/${d}/${y}` : iso;
}

/** Patient record height ("5'6\"") → answer fields. */
export function splitHeight(height = ""): { ft: string; inches: string } {
  const [ft = "", inches = ""] = height.replace(/["″]/g, "").split(/['′]/).map(s => s.trim());
  return { ft, inches };
}

export function heightToCm(ft: string, inches: string): number {
  const f = parseFloat(ft) || 0;
  const i = parseFloat(inches) || 0;
  return Math.round((f * 12 + i) * 2.54);
}
