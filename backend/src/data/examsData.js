/**
 * Comprehensive Dataset of Indian Government, Civil Services, Defence, SSC, Banking,
 * Railways, Paramilitary & Competitive Examinations with Latest Official Eligibility Criteria.
 */

const EXAMS_DATA = [
  // ==========================================
  // 1. DEFENCE EXAMINATIONS
  // ==========================================
  {
    id: 'nda',
    title: 'UPSC National Defence Academy & Naval Academy Examination (NDA & NA)',
    shortName: 'UPSC NDA',
    category: 'Defence Exams',
    conductingBody: 'Union Public Service Commission (UPSC)',
    officialWebsite: 'https://upsc.gov.in',
    officialPortalName: 'UPSC Official Portal (upsc.gov.in)',
    isOfficialVerified: true,
    description: 'Entry into Army, Navy, and Air Force Wings of the National Defence Academy (NDA Dehradun/Khadakwasla) and 4-Year B.Tech Cadets Entry at Indian Naval Academy (INA Ezhimala).',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-20 (As per UPSC Gazette Notification)',
    source: 'UPSC Official NDA Gazette Notification',
    vacancies: '400 Seats',
    importantDates: {
      notificationDate: '2026-05-15',
      applyStartDate: '2026-05-15',
      applyDeadline: '2026-06-04',
      examDate: '2026-09-01'
    },
    eligibilityCriteria: {
      age: {
        minAge: 16.5,
        maxAge: 19.5,
        cutoffDobMin: '2nd Jan 2007',
        cutoffDobMax: '1st Jan 2010',
        relaxationsText: 'No age relaxation for SC/ST/OBC in NDA as per Armed Forces Cadet Entry Rules.'
      },
      gender: 'Unmarried Male & Female',
      maritalStatus: ['Unmarried'],
      nationality: ['Citizen of India', 'Subject of Nepal', 'Tibetan Refugee (Pre-1962)'],
      education: {
        minLevel: '12th',
        requiredStreams: ['Science (PCM)'],
        streamRulesText: 'Army Wing: 12th Pass in ANY Stream. Air Force & Navy Wing: 12th Pass with Physics, Chemistry & Mathematics (PCM).',
        minPercentage: null,
        finalYearEligible: true,
        finalYearText: 'Candidates appearing in 12th Standard under 10+2 pattern are eligible to apply conditionally.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: 157.0,
        minHeightFemale: 152.0,
        minHeightFlying: 162.5,
        minChestMale: 81.0,
        chestExpansion: 5.0,
        heightRelaxationsText: 'Relaxation of 5cm for candidates belonging to Gorkhas, Garhwalis, Kumaonis and North-East hill regions. 2cm for Lakshadweep.',
        visionRequirements: '6/6 in better eye, 6/9 in worse eye. Uncorrected vision requirements apply for Flying Branch.'
      },
      specialRequirements: {
        nccCertificate: 'Preferred',
        nccText: 'NCC Cadets get priority during interview tie-breakers and SSB preparation weightage.',
        other: 'Must be physically fit as per Armed Forces Medical Standards.'
      }
    },
    requiredDocuments: [
      'Aadhaar Card / Govt Photo ID Proof',
      '10th Class Passing Certificate (Age Proof)',
      '12th Class Marksheet & Certificate (or Bonafide Certificate if in 12th)',
      'Category / Caste Certificate (if claiming fee exemption)',
      'NCC Certificate (if held)',
      'Passport size photographs'
    ],
    selectionProcess: [
      'Written Examination by UPSC (Mathematics 300 marks + GAT 600 marks = 900 marks)',
      'SSB Interview (5 Days - Stage I PPDT/OIR + Stage II Psychological, GTO & Personal Interview)',
      'Medical Examination at Armed Forces Hospitals',
      'Final All-India Merit List'
    ]
  },
  {
    id: 'cds-ima-ota',
    title: 'UPSC Combined Defence Services Examination (CDS - IMA, INA, AFA & OTA)',
    shortName: 'UPSC CDS',
    category: 'Defence Exams',
    conductingBody: 'Union Public Service Commission (UPSC)',
    officialWebsite: 'https://upsc.gov.in',
    officialPortalName: 'UPSC Official Portal (upsc.gov.in)',
    isOfficialVerified: true,
    description: 'Recruitment for Permanent & Short Service Commission Officers in Indian Military Academy (IMA Dehradun), Indian Naval Academy (INA Ezhimala), Air Force Academy (AFA Hyderabad), and Officers Training Academy (OTA Chennai).',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-15 (As per UPSC Gazette Notification)',
    source: 'UPSC CDS Official Gazette',
    vacancies: '459 Vacancies',
    importantDates: {
      notificationDate: '2026-05-15',
      applyStartDate: '2026-05-15',
      applyDeadline: '2026-06-04',
      examDate: '2026-09-01'
    },
    eligibilityCriteria: {
      age: {
        minAge: 19,
        maxAge: 24,
        maxAgeOta: 25,
        cutoffDobMin: '2nd Jan 2002',
        cutoffDobMax: '1st Jan 2007',
        relaxationsText: 'IMA / INA / AFA max age is 24 years (Unmarried). OTA max age is 25 years (Unmarried males & unmarried females).'
      },
      gender: 'Male & Female',
      maritalStatus: ['Unmarried'],
      nationality: ['Citizen of India', 'Subject of Nepal'],
      education: {
        minLevel: 'Graduation',
        requiredStreams: ['Any Stream'],
        streamRulesText: 'IMA & OTA: Degree of a recognized University in ANY discipline. INA: Degree in Engineering (B.E/B.Tech). AFA: Degree with Physics & Mathematics at 10+2 level OR B.E/B.Tech.',
        minPercentage: null,
        finalYearEligible: true,
        finalYearText: 'Candidates studying in the final year/semester of Graduation degree are eligible to apply conditionally.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: 157.5,
        minHeightFemale: 152.0,
        minHeightNavy: 157.0,
        minHeightAirForce: 162.5,
        minChestMale: 77.0,
        chestExpansion: 5.0,
        heightRelaxationsText: '5cm relaxation for candidates from North-East, Gorkhas, Garhwali & Kumaon regions.',
        visionRequirements: '6/6 better eye, 6/9 worse eye. Myopia not more than -3.5D, Hypermetropia not more than +3.5D.'
      },
      specialRequirements: {
        nccCertificate: 'None Required for CDS Exam (See NCC Special Entry for Direct SSB)',
        other: 'Unmarried status compulsory at time of joining academy.'
      }
    },
    requiredDocuments: [
      'Govt Photo ID (Aadhaar Card / Voter ID / Passport)',
      '10th / Matriculation Certificate for Date of Birth Verification',
      '12th Marksheet showing Physics & Maths (for AFA)',
      'Graduation Degree Certificate or Semester Marksheets',
      'Bonafide Certificate from Principal if pursuing Final Year Degree',
      'Category Certificate (SC/ST/OBC/EWS) if applicable'
    ],
    selectionProcess: [
      'UPSC Written Exam (English, GK, Elementary Maths for IMA/INA/AFA; English & GK for OTA)',
      '5-Day SSB Interview (Stage I Screening & Stage II Testing)',
      'CPSS (Computerised Pilot Selection System) for Air Force Flying Branch',
      'Armed Forces Medical Examination',
      'Final Merit List'
    ]
  },
  {
    id: 'afcat',
    title: 'Air Force Common Admission Test (AFCAT - Flying & Ground Duty Branches)',
    shortName: 'IAF AFCAT',
    category: 'Defence Exams',
    conductingBody: 'Indian Air Force (IAF / CDAC)',
    officialWebsite: 'https://afcat.cdac.in',
    officialPortalName: 'AFCAT CDAC Official Portal (afcat.cdac.in)',
    isOfficialVerified: true,
    description: 'Commissioned Officer entry into Flying Branch and Ground Duty (Technical & Non-Technical) branches of the Indian Air Force.',
    notificationStatus: 'Upcoming',
    lastVerifiedDate: '2026-08-10 (As per IAF Official Bulletin)',
    source: 'Indian Air Force Career Portal',
    vacancies: '300+ Officers',
    importantDates: {
      notificationDate: '2026-11-20',
      applyStartDate: '2026-12-01',
      applyDeadline: '2026-12-30',
      examDate: '2027-02-15'
    },
    eligibilityCriteria: {
      age: {
        minAge: 20,
        maxAge: 24,
        maxAgeGroundDuty: 26,
        cutoffDobMin: '2nd Jan 2003',
        cutoffDobMax: '1st Jan 2007',
        relaxationsText: 'Flying Branch: 20 to 24 Years (Up to 26 years for Commercial Pilot License holders). Ground Duty Tech/Non-Tech: 20 to 26 Years.'
      },
      gender: 'Male & Female',
      maritalStatus: ['Unmarried'],
      nationality: ['Citizen of India'],
      education: {
        minLevel: 'Graduation',
        requiredStreams: ['Science (PCM)', 'Engineering / B.Tech', 'Any Graduate'],
        streamRulesText: 'Flying Branch: Min 50% marks each in Maths & Physics at 12th level AND Graduation with min 60% marks OR B.E/B.Tech with min 60%. Ground Duty Tech: 4-Yr B.E/B.Tech with min 60%. Ground Duty Non-Tech: Min 60% in Graduation.',
        minPercentage: 60,
        finalYearEligible: true,
        finalYearText: 'Final year students without backlogs are eligible provided degree is completed before commencement of course.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: 162.5,
        minHeightFemale: 162.5,
        minHeightGroundDutyMale: 157.5,
        minHeightGroundDutyFemale: 152.0,
        heightRelaxationsText: '5cm relaxation for candidates from North-East & Gorkha regions.',
        visionRequirements: '6/6 in better eye, 6/9 in worse eye. Color vision CP-1.'
      },
      specialRequirements: {
        nccCertificate: 'C Certificate Option Available (Air Wing C Certificate gives direct AFSB entry!)',
        other: 'Commercial Pilot License (CPL) issued by DGCA gives age relaxation up to 26 years for Flying Branch.'
      }
    },
    requiredDocuments: [
      'Aadhaar Card',
      '10th Certificate for DOB',
      '12th Marksheet showing Min 50% in Physics & Maths',
      'Graduation Degree / Semester Marksheets with Min 60% aggregate',
      'NCC Air Wing C-Certificate (if applying through NCC Special Entry)',
      'DGCA Commercial Pilot License (if applicable)'
    ],
    selectionProcess: [
      'AFCAT Online Written Test (100 Questions, 300 Marks - General Awareness, Verbal Ability, Numerical Ability, Reasoning)',
      'EKT (Engineering Knowledge Test) for Technical Ground Duty candidates',
      'Air Force Selection Board (AFSB Interview at Dehradun, Mysore, Gandhinagar, Varanasi)',
      'CPSS Testing for Flying Branch',
      'Medical Evaluation'
    ]
  },
  {
    id: 'ncc-special-entry',
    title: 'Indian Army NCC Special Entry Scheme (Direct SSB Entry - No Written Exam)',
    shortName: 'Army NCC Special Entry',
    category: 'Defence Exams',
    conductingBody: 'Indian Army (Join Indian Army)',
    officialWebsite: 'https://joinindianarmy.nic.in',
    officialPortalName: 'Join Indian Army Portal (joinindianarmy.nic.in)',
    isOfficialVerified: true,
    description: 'Direct Short Service Commission (SSC) Officer entry for NCC Senior Division / Senior Wing cadets into the Indian Army without appearing for any written examination.',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-18 (As per Indian Army Rtg Directorate)',
    source: 'Join Indian Army Official Notification',
    vacancies: '55 Seats (50 Male, 5 Female)',
    importantDates: {
      notificationDate: '2026-07-01',
      applyStartDate: '2026-07-10',
      applyDeadline: '2026-08-10',
      examDate: 'Direct SSB Interview Call-up'
    },
    eligibilityCriteria: {
      age: {
        minAge: 19,
        maxAge: 25,
        cutoffDobMin: '2nd July 2001',
        cutoffDobMax: '1st July 2007',
        relaxationsText: 'Age must be between 19 to 25 years as of 1st Jan of course year. Wards of Battle Casualties also eligible.'
      },
      gender: 'Male & Female',
      maritalStatus: ['Unmarried'],
      nationality: ['Citizen of India', 'Subject of Nepal'],
      education: {
        minLevel: 'Graduation',
        requiredStreams: ['Any Stream'],
        streamRulesText: 'Degree of a recognized University or equivalent with aggregate of minimum 50% marks taking into account marks of all years.',
        minPercentage: 50,
        finalYearEligible: true,
        finalYearText: 'Final year students who have secured min 50% in aggregate up to 2nd year (3-yr course) or 3rd year (4-yr course) are eligible.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: 157.5,
        minHeightFemale: 152.0,
        heightRelaxationsText: '5cm height relaxation for North-East candidates, Gorkhas and Garhwalis.',
        visionRequirements: '6/6 in better eye, 6/9 in worse eye.'
      },
      specialRequirements: {
        nccCertificate: 'C Certificate Mandatory (Min B Grade)',
        nccText: 'Must have served for min 2 academic years in Senior Division/Wing of NCC AND obtained minimum B Grade in NCC C-Certificate Exam.',
        other: 'Exemption from UPSC CDS Written Exam! Direct Call-up for 5-Day SSB Interview.'
      }
    },
    requiredDocuments: [
      'NCC C-Certificate with Grade A or B (Mandatory)',
      'Graduation Degree Certificate / Provisional Degree showing Min 50% aggregate',
      '10th Class Board Certificate for DOB proof',
      '12th Class Marksheet',
      'Certificate from NCC Unit Commanding Officer confirming 2 years SD/SW service',
      'Aadhaar / Passport ID'
    ],
    selectionProcess: [
      'Shortlisting of Applications based on Graduation Marks and NCC C-Certificate Grade',
      'Direct 5-Day SSB Interview Call at Selection Centres (Prayagraj, Bhopal, Bengaluru, Kapurthala)',
      'Medical Board Examination',
      'Final Merit List for Officers Training Academy (OTA Chennai)'
    ]
  },
  {
    id: 'agniveer-army',
    title: 'Indian Army Agniveer Recruitment (General Duty, Tech, Clerk & Tradesman)',
    shortName: 'Agniveer Army',
    category: 'Defence Exams',
    conductingBody: 'Indian Army Agnipath Scheme',
    officialWebsite: 'https://joinindianarmy.nic.in',
    officialPortalName: 'Join Indian Army Agnipath (joinindianarmy.nic.in)',
    isOfficialVerified: true,
    description: 'Enrolment under Agnipath Scheme as Agniveer General Duty (GD), Agniveer Technical, Agniveer Office Assistant/Clerk, and Agniveer Tradesmen.',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-01',
    source: 'Indian Army Official Recruitment Rally Notification',
    vacancies: '25,000+ Rally Posts Across All ZROs',
    importantDates: {
      notificationDate: '2026-02-10',
      applyStartDate: '2026-02-15',
      applyDeadline: '2026-03-25',
      examDate: 'Online CEE & Physical Rally Phase'
    },
    eligibilityCriteria: {
      age: {
        minAge: 17.5,
        maxAge: 21,
        cutoffDobMin: '1st Oct 2004',
        cutoffDobMax: '1st April 2008',
        relaxationsText: 'Upper age limit is 21 years across all Agniveer categories.'
      },
      gender: 'Male & Female (Agniveer Women MP)',
      maritalStatus: ['Unmarried'],
      nationality: ['Citizen of India'],
      education: {
        minLevel: '10th',
        requiredStreams: ['10th Pass', '12th PCM for Tech', '12th Any for Clerk'],
        streamRulesText: 'GD: 10th Pass with 45% aggregate (33% in each subject). Tech: 12th Pass with PCM and English with 50% aggregate (40% in each subject). Clerk/Store Keeper: 12th Pass in any stream with 60% aggregate (50% in English & Maths/Accounts). Tradesman: 8th or 10th Simple Pass.',
        minPercentage: 45,
        finalYearEligible: false,
        finalYearText: 'Must have passed required qualification at time of application submission.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: 169.0,
        minHeightFemale: 162.0,
        minChestMale: 77.0,
        chestExpansion: 5.0,
        heightRelaxationsText: 'Relaxation for Sportsmen, Sons of Servicemen/Ex-Servicemen (2cm height, 1cm chest, 2kg weight). Regional height relaxation for Eastern Plains (169cm) / Hilly regions (163cm).',
        visionRequirements: '6/6 distance vision without glasses.'
      },
      specialRequirements: {
        nccCertificate: 'Bonus Marks',
        nccText: 'Bonus Marks in CEE: NCC A Cert = 5 marks, B Cert = 10 marks, C Cert = 20 marks (Exemption from CEE for GD entry for C cert!).',
        other: 'Must clear Physical Fitness Test: 1.6 Km Run (Group I: Under 5 min 30 sec = 60 marks), Beam Pull-ups, 9ft Ditch, Zig-Zag Balance.'
      }
    },
    requiredDocuments: [
      '10th / 12th Pass Marksheets and Board Certificates',
      'Domicile / Residence Certificate with Photograph signed by Tehsildar',
      'Caste Certificate with Photograph issued by District Magistrate / Tehsildar',
      'Unmarried Certificate signed by Village Sarpanch / Ward Member',
      'Character Certificate signed by School Principal / Sarpanch',
      'NCC Certificate / Sports Certificate (for bonus points)',
      'Relationship Certificate (for Sons of Servicemen / Ex-Servicemen)'
    ],
    selectionProcess: [
      'Phase I: Online Common Entrance Exam (CEE) by Indian Army',
      'Phase II: Physical Fitness Test (PFT) & Physical Measurement Test (PMT) at ZRO Recruitment Rally',
      'Phase III: Medical Examination',
      'Phase IV: Final Merit List & Dispatch to Training Centres'
    ]
  },

  // ==========================================
  // 2. CIVIL SERVICES & STATE PSC EXAMS
  // ==========================================
  {
    id: 'upsc-cse',
    title: 'UPSC Civil Services Examination (IAS, IPS, IFS, IRS & Central Services)',
    shortName: 'IAS / UPSC CSE',
    category: 'Civil Services',
    conductingBody: 'Union Public Service Commission (UPSC)',
    officialWebsite: 'https://upsc.gov.in',
    officialPortalName: 'UPSC Official Portal (upsc.gov.in)',
    isOfficialVerified: true,
    description: 'India\'s premier competitive examination for recruitment to Indian Administrative Service (IAS), Indian Police Service (IPS), Indian Foreign Service (IFS), Indian Revenue Service (IRS), and 20+ Group A/B Services.',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-10 (As per UPSC Official Gazette)',
    source: 'UPSC Civil Services Gazette Notification',
    vacancies: '1056 Posts',
    importantDates: {
      notificationDate: '2026-02-14',
      applyStartDate: '2026-02-14',
      applyDeadline: '2026-03-05',
      examDate: '2026-05-26'
    },
    eligibilityCriteria: {
      age: {
        minAge: 21,
        maxAge: 32,
        cutoffDobMin: '2nd August 1994',
        cutoffDobMax: '1st August 2005',
        relaxationsText: 'General: 32 yrs (6 attempts). OBC: 35 yrs (9 attempts). SC/ST: 37 yrs (Unlimited attempts). PwD: 42 yrs (9/Unlimited attempts).'
      },
      gender: 'All (Male, Female, Transgender)',
      maritalStatus: ['Unmarried', 'Married'],
      nationality: ['Citizen of India (for IAS, IPS, IFS)'],
      education: {
        minLevel: 'Graduation',
        requiredStreams: ['Any Stream'],
        streamRulesText: 'Must hold a degree of any university incorporated by an Act of Central or State Legislature in India or deemed university.',
        minPercentage: null,
        finalYearEligible: true,
        finalYearText: 'Candidates who have appeared or intend to appear for final year degree exam are eligible for Prelims.'
      },
      physicalStandards: {
        applicable: false,
        minHeightMale: 165.0, // For IPS / RPF only
        minHeightFemale: 150.0,
        heightRelaxationsText: 'Physical standards apply only for technical services like IPS, RPF, DANIPS (Min height 165cm for male, 150cm for female). No physical standard requirement for IAS/IFS/IRS.',
        visionRequirements: 'Normal vision required for IPS.'
      },
      specialRequirements: {
        nccCertificate: 'Optional',
        other: 'Must fulfill attempt limit: Gen (6), OBC (9), SC/ST (Unlimited till 37 yrs).'
      }
    },
    requiredDocuments: [
      'Govt Photo ID (Aadhaar Card / Voter ID / Passport / Driving License)',
      '10th Board Certificate for Date of Birth Verification',
      'Graduation Degree Certificate or Final Year Provisional Certificate',
      'Community / Caste Certificate (OBC Non-Creamy Layer / SC / ST / EWS Certificate)',
      'Benchmark Disability Certificate (for PwD candidates)'
    ],
    selectionProcess: [
      'Stage I: Civil Services Preliminary Examination (GS Paper I - 200 marks + CSAT Paper II - 200 marks qualifying 33%)',
      'Stage II: Civil Services Main Examination (9 Written Descriptive Papers - 1750 marks)',
      'Stage III: Personality Test / Interview at Dholpur House, New Delhi (275 marks)',
      'Final All-India Ranking list out of 2025 marks'
    ]
  },
  {
    id: 'opsc-oas',
    title: 'Odisha Public Service Commission Civil Services Examination (OPSC OAS / OPS / ORS)',
    shortName: 'OPSC OAS',
    category: 'Civil Services',
    conductingBody: 'Odisha Public Service Commission (OPSC)',
    officialWebsite: 'https://opsc.gov.in',
    officialPortalName: 'OPSC Official Portal (opsc.gov.in)',
    isOfficialVerified: true,
    description: 'Recruitment to Odisha Administrative Service (OAS Group-A), Odisha Police Service (OPS Group-A), Odisha Revenue Service (ORS Group-B), and State Executive cadres.',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-05',
    source: 'OPSC Official Gazette Notice',
    vacancies: '683 Posts',
    importantDates: {
      notificationDate: '2026-01-15',
      applyStartDate: '2026-01-17',
      applyDeadline: '2026-02-16',
      examDate: '2026-10-15'
    },
    eligibilityCriteria: {
      age: {
        minAge: 21,
        maxAge: 38,
        cutoffDobMin: '2nd Jan 1988',
        cutoffDobMax: '1st Jan 2005',
        relaxationsText: 'General: 38 yrs. 5 years relaxation for SC/ST/SEBC/Women candidates (Up to 43 yrs). 10 years for Ex-Servicemen & PwD.'
      },
      gender: 'All',
      maritalStatus: ['Unmarried', 'Married'],
      nationality: ['Citizen of India'],
      education: {
        minLevel: 'Graduation',
        requiredStreams: ['Any Stream'],
        streamRulesText: 'Bachelor\'s Degree in any discipline from a recognized University.',
        minPercentage: null,
        finalYearEligible: true,
        finalYearText: 'Final year degree candidates can apply provided degree proof is submitted before Mains.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: 165.0, // OPS Police Service
        minHeightFemale: 150.0,
        heightRelaxationsText: 'Physical standards mandatory for Odisha Police Service (OPS) only: Height 165cm (Male), 150cm (Female), Chest 84cm (Male).',
        visionRequirements: 'Normal vision required for OPS.'
      },
      specialRequirements: {
        nccCertificate: 'Desirable',
        other: 'Must be able to Read, Write and Speak Odia language AND passed 7th / High School with Odia as a language subject.'
      }
    },
    requiredDocuments: [
      'Aadhaar Card',
      '10th Board Certificate with Odia subject proof',
      '12th Marksheet',
      'Bachelor Degree Certificate',
      'SEBC / SC / ST Certificate issued by Competent Odisha Authority',
      'Resident / Domicile Certificate of Odisha'
    ],
    selectionProcess: [
      'Preliminary Examination (Paper I GS + Paper II CSAT)',
      'Main Examination (Written Descriptive Papers)',
      'Viva-Voce / Personality Test in Cuttack',
      'State Merit Cadre Allocation'
    ]
  },

  // ==========================================
  // 3. STAFF SELECTION COMMISSION (SSC) EXAMS
  // ==========================================
  {
    id: 'ssc-cgl',
    title: 'SSC Combined Graduate Level Examination (SSC CGL - Inspector, ASO, Auditor)',
    shortName: 'SSC CGL',
    category: 'SSC Exams',
    conductingBody: 'Staff Selection Commission (SSC)',
    officialWebsite: 'https://ssc.gov.in',
    officialPortalName: 'SSC New Official Portal (ssc.gov.in)',
    isOfficialVerified: true,
    description: 'Recruitment for Group B and Group C Officers in Central Ministries, Income Tax Department, Central Excise Inspector, Assistant Section Officer (ASO), ED, CBI, Auditor & Accountant.',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-22 (As per SSC Annual Calendar)',
    source: 'SSC CGL Official Notification',
    vacancies: '17,727 Posts',
    importantDates: {
      notificationDate: '2026-06-24',
      applyStartDate: '2026-06-24',
      applyDeadline: '2026-07-27',
      examDate: '2026-09-20'
    },
    eligibilityCriteria: {
      age: {
        minAge: 18,
        maxAge: 30,
        maxAgeCertainPosts: 32,
        cutoffDobMin: '2nd August 1996',
        cutoffDobMax: '1st August 2008',
        relaxationsText: 'OBC: +3 Years (33 yrs). SC/ST: +5 Years (35 yrs). PwD: +10 Years. Ex-Servicemen: 3 years after deduction of military service.'
      },
      gender: 'All',
      maritalStatus: ['Unmarried', 'Married'],
      nationality: ['Citizen of India', 'Subject of Nepal'],
      education: {
        minLevel: 'Graduation',
        requiredStreams: ['Any Stream'],
        streamRulesText: 'Bachelor\'s Degree from a recognized University. For Junior Statistical Officer (JSO): Bachelor\'s Degree with min 60% in Maths at 12th level OR Statistics as a degree subject.',
        minPercentage: null,
        finalYearEligible: true,
        finalYearText: 'Candidates in final year can apply if result is declared before cutoff date.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: 157.5, // Central Excise / Customs Inspector
        minHeightFemale: 152.0,
        minChestMale: 81.0,
        chestExpansion: 5.0,
        heightRelaxationsText: 'Physical measurement test applies for Inspector (Central Excise/Examiner/Preventive Officer/CBN/CBI). Height relaxation of 5cm for Garhwalis, Assamese, Gorkhas & ST candidates.',
        visionRequirements: '6/6 distance vision.'
      },
      specialRequirements: {
        nccCertificate: 'Not Mandatory',
        other: 'Data Entry Speed Test (DEST) computer typing proficiency mandatory during Tier II exam.'
      }
    },
    requiredDocuments: [
      'Govt Photo ID Card (Aadhaar / Voter ID)',
      '10th Class Certificate for DOB proof',
      '12th Marksheet',
      'Graduation Degree / Provisional Passing Certificate',
      'Category Certificate (OBC Non-Creamy Layer / SC / ST / EWS)',
      'Disability Certificate (for PwD candidates)'
    ],
    selectionProcess: [
      'Tier-I Computer Based Examination (Reasoning, GA, Quantitative Aptitude, English)',
      'Tier-II Computer Based Examination (Paper I Compulsory + Paper II JSO Statistics)',
      'Data Entry Speed Test (DEST) & Module Typing Verification',
      'Document Verification & Physical Test for Inspector posts'
    ]
  },
  {
    id: 'ssc-gd',
    title: 'SSC GD Constable Examination (BSF, CISF, CRPF, SSB, ITBP, AR, SSF)',
    shortName: 'SSC GD',
    category: 'SSC Exams',
    conductingBody: 'Staff Selection Commission & MHA',
    officialWebsite: 'https://ssc.gov.in',
    officialPortalName: 'SSC Official Portal (ssc.gov.in)',
    isOfficialVerified: true,
    description: 'Enrolment as General Duty Constable in Central Armed Police Forces (CAPFs), Secretarial Security Force (SSF), and Rifleman in Assam Rifles.',
    notificationStatus: 'Upcoming',
    lastVerifiedDate: '2026-08-15',
    source: 'SSC Examination Calendar 2026',
    vacancies: '39,481 Posts',
    importantDates: {
      notificationDate: '2026-09-05',
      applyStartDate: '2026-09-05',
      applyDeadline: '2026-10-14',
      examDate: '2027-01-10'
    },
    eligibilityCriteria: {
      age: {
        minAge: 18,
        maxAge: 23,
        cutoffDobMin: '2nd Jan 2004',
        cutoffDobMax: '1st Jan 2009',
        relaxationsText: 'OBC: +3 Years (26 yrs max). SC/ST: +5 Years (28 yrs max). Ex-Servicemen: 3 yrs after military service.'
      },
      gender: 'Male & Female',
      maritalStatus: ['Unmarried', 'Married'],
      nationality: ['Citizen of India (State Domicile mandatory)'],
      education: {
        minLevel: '10th',
        requiredStreams: ['10th Pass'],
        streamRulesText: 'Matriculation or 10th Class pass from a recognized Board/University.',
        minPercentage: null,
        finalYearEligible: false,
        finalYearText: 'Must have passed 10th class on or before the closing date of application.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: 170.0,
        minHeightFemale: 157.0,
        minChestMale: 80.0,
        chestExpansion: 5.0,
        heightRelaxationsText: 'ST Male: 162.5cm, ST Female: 150cm. Candidates from NE states: Male 162.5cm, Female 152.5cm. Gorkhas & Garhwalis: Male 165cm, Female 155cm.',
        visionRequirements: '6/6 better eye, 6/9 worse eye without visual correction.'
      },
      specialRequirements: {
        nccCertificate: 'Bonus Marks Added to Written Test Score',
        nccText: 'NCC C Certificate = 5% of max marks bonus (8 marks). NCC B Cert = 3% bonus (4.8 marks). NCC A Cert = 2% bonus (3.2 marks).',
        other: 'Physical Efficiency Test (PET): Male 5 Km run in 24 mins. Female 1.6 Km run in 8.5 mins.'
      }
    },
    requiredDocuments: [
      '10th Class Marksheet & Board Certificate',
      'Domicile / Permanent Resident Certificate of State/UT (Mandatory)',
      'Aadhaar Card / Voter ID',
      'Caste Certificate (OBC / SC / ST / EWS) in prescribed Central Govt format',
      'NCC Certificate (for incentive marks)'
    ],
    selectionProcess: [
      'Computer Based Examination (CBE) in 13 Regional Languages + Hindi & English',
      'Physical Efficiency Test (PET) & Physical Standard Test (PST)',
      'Detailed Medical Examination (DME) & Review Medical Exam (RME)',
      'Final District/State Merit List'
    ]
  },
  {
    id: 'ssc-cpo',
    title: 'SSC Central Police Organisation Examination (Sub-Inspector in Delhi Police & CAPFs)',
    shortName: 'SSC CPO',
    category: 'SSC Exams',
    conductingBody: 'Staff Selection Commission (SSC)',
    officialWebsite: 'https://ssc.gov.in',
    officialPortalName: 'SSC Official Portal (ssc.gov.in)',
    isOfficialVerified: true,
    description: 'Recruitment of Sub-Inspectors (SI) in Delhi Police, BSF, CISF, CRPF, ITBP, and SSB.',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-12',
    source: 'SSC CPO Official Gazette',
    vacancies: '4,187 Posts',
    importantDates: {
      notificationDate: '2026-03-04',
      applyStartDate: '2026-03-04',
      applyDeadline: '2026-03-28',
      examDate: '2026-06-27'
    },
    eligibilityCriteria: {
      age: {
        minAge: 20,
        maxAge: 25,
        cutoffDobMin: '2nd August 2001',
        cutoffDobMax: '1st August 2006',
        relaxationsText: 'OBC: +3 Years (28 yrs). SC/ST: +5 Years (30 yrs). Ex-Servicemen: 3 yrs relaxation after service.'
      },
      gender: 'Male & Female',
      maritalStatus: ['Unmarried', 'Married'],
      nationality: ['Citizen of India'],
      education: {
        minLevel: 'Graduation',
        requiredStreams: ['Any Stream'],
        streamRulesText: 'Bachelor\'s degree from a recognized university or equivalent.',
        minPercentage: null,
        finalYearEligible: true,
        finalYearText: 'Final year degree candidates eligible if result declared before cutoff date.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: 170.0,
        minHeightFemale: 157.0,
        minChestMale: 80.0,
        chestExpansion: 5.0,
        heightRelaxationsText: 'Male candidates of Hill areas (Garhwal, Kumaon, Himachal, Gorkhas, Dogras, NE): 165cm. ST Male: 162.5cm. ST Female: 154cm.',
        visionRequirements: '6/6 better eye, 6/9 worse eye.'
      },
      specialRequirements: {
        nccCertificate: 'Bonus Marks Added',
        nccText: 'NCC C Certificate = 10 marks bonus in Paper I & II. NCC B Cert = 6 marks. NCC A Cert = 4 marks.',
        other: 'For Delhi Police SI Post ONLY: Male candidates MUST possess a valid Driving License for LMV (Motorcycle and Car) on PET date.'
      }
    },
    requiredDocuments: [
      'Graduation Degree / Marksheet',
      'Valid LMV Driving License for Motorcycle & Car (Mandatory for Male Delhi Police SI)',
      '10th Board Certificate for DOB proof',
      'Category Certificate (SC/ST/OBC/EWS)',
      'NCC Certificate (if claiming bonus marks)'
    ],
    selectionProcess: [
      'Paper-I Computer Based Test (200 Marks)',
      'Physical Endurance Test (PET) & Physical Standard Test (PST)',
      'Paper-II English Language Test (200 Marks)',
      'Detailed Medical Examination (DME)'
    ]
  },

  // ==========================================
  // 4. BANKING & FINANCIAL EXAMINATIONS
  // ==========================================
  {
    id: 'ibps-po',
    title: 'IBPS Probationary Officer / Management Trainee Examination (IBPS PO)',
    shortName: 'IBPS PO',
    category: 'Banking & Financial',
    conductingBody: 'Institute of Banking Personnel Selection (IBPS)',
    officialWebsite: 'https://ibps.in',
    officialPortalName: 'IBPS Official Portal (ibps.in)',
    isOfficialVerified: true,
    description: 'Recruitment for Probationary Officers (PO/MT) across 11 Public Sector Banks in India (Bank of Baroda, PNB, Canara Bank, Union Bank, etc.).',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-21',
    source: 'IBPS Official CRP PO/MT XIV Notification',
    vacancies: '4,455 Posts',
    importantDates: {
      notificationDate: '2026-08-01',
      applyStartDate: '2026-08-01',
      applyDeadline: '2026-08-21',
      examDate: '2026-10-19'
    },
    eligibilityCriteria: {
      age: {
        minAge: 20,
        maxAge: 30,
        cutoffDobMin: '2nd August 1996',
        cutoffDobMax: '1st August 2006',
        relaxationsText: 'OBC (Non-Creamy Layer): +3 Years (33 yrs). SC/ST: +5 Years (35 yrs). PwD: +10 Years (40 yrs). Ex-Servicemen: +5 Years.'
      },
      gender: 'All',
      maritalStatus: ['Unmarried', 'Married'],
      nationality: ['Citizen of India', 'Subject of Nepal'],
      education: {
        minLevel: 'Graduation',
        requiredStreams: ['Any Stream'],
        streamRulesText: 'A Degree (Graduation) in any discipline from a University recognized by the Govt. of India.',
        minPercentage: null,
        finalYearEligible: false,
        finalYearText: 'Candidate must possess valid Degree Marksheet/Certificate showing percentage of marks at time of registration.'
      },
      physicalStandards: {
        applicable: false,
        minHeightMale: null,
        minHeightFemale: null,
        heightRelaxationsText: 'No physical height/chest requirements for bank PO posts.',
        visionRequirements: 'Normal vision / PwD visual impairment guidelines apply.'
      },
      specialRequirements: {
        nccCertificate: 'Not Applicable',
        other: 'Computer Literacy: Operating and working knowledge in computer systems is desirable / mandatory.'
      }
    },
    requiredDocuments: [
      'Graduation Degree Certificate / Final Consolidated Marksheet with percentage',
      '10th Board Certificate for Date of Birth',
      'Govt Photo ID (Aadhaar / PAN Card / Passport)',
      'Category Certificate (OBC-NCL / SC / ST / EWS) in Central Govt format',
      'Handwritten Declaration & Left Thumb Impression scan'
    ],
    selectionProcess: [
      'Phase I: Preliminary Exam (100 Marks - English, Quantitative Aptitude, Reasoning)',
      'Phase II: Mains Exam (200 Marks Objective + 25 Marks English Descriptive Essay/Letter)',
      'Phase III: Common Interview by Participating Banks & IBPS (100 Marks)',
      'Final Combined Score Merit (80% Mains + 20% Interview)'
    ]
  },
  {
    id: 'sbi-po',
    title: 'State Bank of India Probationary Officer Examination (SBI PO)',
    shortName: 'SBI PO',
    category: 'Banking & Financial',
    conductingBody: 'State Bank of India (SBI)',
    officialWebsite: 'https://sbi.co.in/web/careers',
    officialPortalName: 'SBI Careers Official Portal (sbi.co.in)',
    isOfficialVerified: true,
    description: 'Premier recruitment for Officer Cadre in State Bank of India with nationwide branch postings and accelerated career progression.',
    notificationStatus: 'Upcoming',
    lastVerifiedDate: '2026-08-10',
    source: 'SBI Central Recruitment Desk',
    vacancies: '2,000 Officers',
    importantDates: {
      notificationDate: '2026-09-15',
      applyStartDate: '2026-09-15',
      applyDeadline: '2026-10-06',
      examDate: '2026-11-25'
    },
    eligibilityCriteria: {
      age: {
        minAge: 21,
        maxAge: 30,
        cutoffDobMin: '2nd April 1995',
        cutoffDobMax: '1st April 2005',
        relaxationsText: 'OBC: +3 Years (33 yrs). SC/ST: +5 Years (35 yrs). PwD (Gen/EWS): +10 Years. PwD (SC/ST): +15 Years.'
      },
      gender: 'All',
      maritalStatus: ['Unmarried', 'Married'],
      nationality: ['Citizen of India'],
      education: {
        minLevel: 'Graduation',
        requiredStreams: ['Any Stream'],
        streamRulesText: 'Graduation in any discipline from a recognized University.',
        minPercentage: null,
        finalYearEligible: true,
        finalYearText: 'Those who are in the Final Year/Semester of Graduation may apply provisionally provided proof of passing is produced at interview.'
      },
      physicalStandards: {
        applicable: false,
        minHeightMale: null,
        minHeightFemale: null,
        heightRelaxationsText: 'No physical height standards required.',
        visionRequirements: 'Standard vision guidelines.'
      },
      specialRequirements: {
        nccCertificate: 'Not Applicable',
        other: 'Attempt Limit Applies: General/EWS (4 attempts), OBC (7 attempts), PwD (7 attempts), SC/ST (No limit).'
      }
    },
    requiredDocuments: [
      'Graduation Degree / Semester Marksheets',
      '10th Board Certificate for DOB proof',
      'Valid Photo ID Proof (Aadhaar Card / PAN / Driving License)',
      'Category Certificate (SC/ST/OBC/EWS)',
      'Left Thumb Impression & Handwritten Declaration'
    ],
    selectionProcess: [
      'Phase I: Preliminary Examination (100 Marks)',
      'Phase II: Main Examination (200 Objective + 50 Descriptive Test)',
      'Phase III: Psychometric Test + Group Exercises (20 Marks) & Interview (30 Marks)',
      'Final Selection Merit List'
    ]
  },

  // ==========================================
  // 5. RAILWAY RECRUITMENT BOARDS (RRB) EXAMS
  // ==========================================
  {
    id: 'rrb-ntpc',
    title: 'RRB Non-Technical Popular Categories Examination (RRB NTPC - Station Master, Guard, Clerk)',
    shortName: 'RRB NTPC',
    category: 'Railway Exams',
    conductingBody: 'Railway Recruitment Boards (RRB / Ministry of Railways)',
    officialWebsite: 'https://rrbcdg.gov.in',
    officialPortalName: 'RRB Official Chandigarh / Zonal Portals (rrbcdg.gov.in)',
    isOfficialVerified: true,
    description: 'Recruitment for Graduate & Undergraduate posts in Indian Railways including Station Master, Goods Guard, Senior Clerk, Commercial Apprentice, and Train Clerk.',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-19',
    source: 'Ministry of Railways CEN 05/2026 & CEN 06/2026',
    vacancies: '11,558 Posts',
    importantDates: {
      notificationDate: '2026-08-05',
      applyStartDate: '2026-08-08',
      applyDeadline: '2026-09-08',
      examDate: '2026-12-15'
    },
    eligibilityCriteria: {
      age: {
        minAge: 18,
        maxAge: 33,
        maxAgeGraduate: 36, // Including 3 year age relaxation given by Indian Railways
        cutoffDobMin: '2nd July 1988',
        cutoffDobMax: '1st July 2008',
        relaxationsText: '3 Years special age relaxation granted for all categories by Ministry of Railways! OBC: +3 Yrs. SC/ST: +5 Yrs. Ex-Servicemen: Service + 3 Yrs.'
      },
      gender: 'All',
      maritalStatus: ['Unmarried', 'Married'],
      nationality: ['Citizen of India', 'Subject of Nepal'],
      education: {
        minLevel: '12th',
        requiredStreams: ['12th Pass for UG Posts', 'Graduation for Graduate Posts'],
        streamRulesText: 'Undergraduate Posts (Level 2 & 3): 12th Pass with min 50% marks (50% not required for SC/ST/Ex-Servicemen). Graduate Posts (Level 4, 5 & 6): Bachelor\'s Degree from recognized University.',
        minPercentage: null,
        finalYearEligible: false,
        finalYearText: 'Must have passed educational qualification at the time of online application.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: null,
        minHeightFemale: null,
        heightRelaxationsText: 'No height criteria. Medical Fitness standard (A-2, A-3, B-2) with strict eyesight standards for Station Master & Traffic Assistant.',
        visionRequirements: 'Distance Vision: 6/9, 6/9 without glasses for Station Master (Medical Standard A-2). Near Vision: Sn 0.6, 0.6 without glasses.'
      },
      specialRequirements: {
        nccCertificate: 'Optional',
        other: 'Computer Based Typing Skill Test (CST) required for Senior Clerk cum Typist posts.'
      }
    },
    requiredDocuments: [
      '10th Board Certificate for DOB proof',
      '12th Marksheet & Certificate (for UG Posts)',
      'Graduation Degree / Marksheets (for Graduate Level Posts)',
      'Caste Certificate (SC/ST/OBC-NCL/EWS) in Railway format for fee concession/free travel pass',
      'Aadhaar Card'
    ],
    selectionProcess: [
      '1st Stage Computer Based Test (CBT-1) - Common Screening',
      '2nd Stage Computer Based Test (CBT-2) - Post specific',
      'Computer Based Aptitude Test (CBAT) for Station Master posts',
      'Typing Skill Test (TST) for Clerk posts',
      'Document Verification (DV) & Medical Examination'
    ]
  },
  {
    id: 'rrb-alp',
    title: 'RRB Assistant Loco Pilot & Technician Examination (RRB ALP)',
    shortName: 'RRB ALP',
    category: 'Railway Exams',
    conductingBody: 'Railway Recruitment Boards (RRB)',
    officialWebsite: 'https://rrbcdg.gov.in',
    officialPortalName: 'RRB Official Portal (rrbcdg.gov.in)',
    isOfficialVerified: true,
    description: 'Technical recruitment for Assistant Loco Pilot (ALP) driving Indian Railways locomotives and Technicians in Railway Workshops.',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-01',
    source: 'RRB CEN 01/2026 Official Gazette',
    vacancies: '18,799 Posts',
    importantDates: {
      notificationDate: '2026-01-19',
      applyStartDate: '2026-01-20',
      applyDeadline: '2026-02-19',
      examDate: '2026-08-25'
    },
    eligibilityCriteria: {
      age: {
        minAge: 18,
        maxAge: 33,
        cutoffDobMin: '2nd July 1991',
        cutoffDobMax: '1st July 2006',
        relaxationsText: 'Age range includes 3 years upper age relaxation. OBC: +3 Yrs (36 yrs). SC/ST: +5 Yrs (38 yrs).'
      },
      gender: 'All',
      maritalStatus: ['Unmarried', 'Married'],
      nationality: ['Citizen of India'],
      education: {
        minLevel: '10th + ITI / Diploma / Degree',
        requiredStreams: ['ITI Trade', 'Diploma Engineering', 'B.Tech / B.E.'],
        streamRulesText: '10th Pass PLUS ITI in relevant trade (Fitter, Electrician, Instrument Mechanic, Millwright, Wireman, Tractor Mechanic, Diesel Mechanic, Turner, Machinist) OR 3-Yr Diploma in Mechanical/Electrical/Electronics/Automobile Engineering OR B.E/B.Tech.',
        minPercentage: null,
        finalYearEligible: false,
        finalYearText: 'Candidates awaiting results of ITI/Diploma/Degree are NOT eligible.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: null,
        minHeightFemale: null,
        heightRelaxationsText: 'No height requirement. Medical Standard A-1 is strictly mandatory.',
        visionRequirements: 'Medical Standard A-1: Distance Vision 6/6, 6/6 without glasses (no fogging test allowed). Must pass Color Vision, Binocular Vision, Field of Vision, and Night Vision tests.'
      },
      specialRequirements: {
        nccCertificate: 'Optional',
        other: 'Strictly zero tolerance for color blindness or LASIK surgery for ALP post.'
      }
    },
    requiredDocuments: [
      '10th / Matriculation Certificate',
      'ITI Trade Certificate / NCVT National Trade Certificate OR Diploma / B.Tech Degree Certificate',
      'Category Certificate (SC/ST/OBC-NCL/EWS)',
      'Aadhaar Card',
      'Medical Certificate (for CBAT stage)'
    ],
    selectionProcess: [
      'CBT Stage 1 (Screening Test - 75 Questions)',
      'CBT Stage 2 (Part A Core Subjects 100 Marks + Part B Trade Test 75 Marks qualifying 35%)',
      'Computer Based Aptitude Test (CBAT - Psycho Test for ALP candidates)',
      'Document Verification & Strict A-1 Medical Board Exam'
    ]
  },

  // ==========================================
  // 6. POLICE & PARAMILITARY EXAMINATIONS
  // ==========================================
  {
    id: 'capf-ac',
    title: 'UPSC Central Armed Police Forces Assistant Commandant Examination (CAPF AC)',
    shortName: 'CAPF AC',
    category: 'Police & Paramilitary',
    conductingBody: 'Union Public Service Commission (UPSC)',
    officialWebsite: 'https://upsc.gov.in',
    officialPortalName: 'UPSC Official Portal (upsc.gov.in)',
    isOfficialVerified: true,
    description: 'Direct entry for Gazetted Group-A Officers (Assistant Commandant) in Border Security Force (BSF), Central Reserve Police Force (CRPF), Central Industrial Security Force (CISF), Indo-Tibetan Border Police (ITBP), and Sashastra Seema Bal (SSB).',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-14',
    source: 'UPSC CAPF AC Official Notification',
    vacancies: '506 Officers',
    importantDates: {
      notificationDate: '2026-04-24',
      applyStartDate: '2026-04-24',
      applyDeadline: '2026-05-14',
      examDate: '2026-08-04'
    },
    eligibilityCriteria: {
      age: {
        minAge: 20,
        maxAge: 25,
        cutoffDobMin: '2nd August 2001',
        cutoffDobMax: '1st August 2006',
        relaxationsText: 'OBC: +3 Years (28 yrs). SC/ST: +5 Years (30 yrs). Civilian Central Govt Servicemen: +5 Years.'
      },
      gender: 'Male & Female',
      maritalStatus: ['Unmarried', 'Married'],
      nationality: ['Citizen of India'],
      education: {
        minLevel: 'Graduation',
        requiredStreams: ['Any Stream'],
        streamRulesText: 'Must hold a Bachelor\'s degree of a recognized University in any discipline.',
        minPercentage: null,
        finalYearEligible: true,
        finalYearText: 'Candidates appearing in final year degree exam can apply conditionally.'
      },
      physicalStandards: {
        applicable: true,
        minHeightMale: 165.0,
        minHeightFemale: 157.0,
        minChestMale: 81.0,
        chestExpansion: 5.0,
        heightRelaxationsText: 'Height relaxation of 5cm for Gorkhas, Garhwalis, Kumaonis, Nagas, Marathas & ST candidates.',
        visionRequirements: '6/6 better eye, 6/12 worse eye. Corrected vision with glasses permitted.'
      },
      specialRequirements: {
        nccCertificate: 'NCC B & C Certificate Holders get preference during Interview/Personality Test',
        other: 'Physical Efficiency Test (PET): 100m race (Male 16 sec, Female 18 sec), 800m race (Male 3 min 45 sec, Female 4 min 45 sec), Long Jump (Male 3.5m, Female 3.0m), Shot Put 7.26kg (Male 4.5m).'
      }
    },
    requiredDocuments: [
      'Graduation Degree / Semester Marksheet',
      '10th Board Certificate for DOB verification',
      'Aadhaar / Voter ID',
      'Category Certificate (SC/ST/OBC/EWS)',
      'NCC B or C Certificate (if held for interview weightage)'
    ],
    selectionProcess: [
      'UPSC Written Exam (Paper I GS & Intelligence 250 Marks + Paper II Essay, Precis & Comprehension 200 Marks)',
      'Physical Standards / Physical Efficiency Tests (PET) & Medical Standards Tests',
      'Personality Test / Interview at UPSC New Delhi (150 Marks)',
      'Final Selection Merit List'
    ]
  },

  // ==========================================
  // 7. TEACHING & EDUCATION EXAMINATIONS
  // ==========================================
  {
    id: 'ctet',
    title: 'Central Teacher Eligibility Test (CTET - Paper I & Paper II)',
    shortName: 'CTET',
    category: 'Teaching & Education',
    conductingBody: 'Central Board of Secondary Education (CBSE / CTET)',
    officialWebsite: 'https://ctet.nic.in',
    officialPortalName: 'CTET Official Portal (ctet.nic.in)',
    isOfficialVerified: true,
    description: 'National eligibility examination for appointment as Primary Teacher (Classes I to V - Paper I) and Elementary Teacher (Classes VI to VIII - Paper II) in Central Govt schools (KVS, NVS, Army Public Schools).',
    notificationStatus: 'Active / Open',
    lastVerifiedDate: '2026-08-18',
    source: 'CBSE CTET Information Bulletin',
    vacancies: 'Eligibility Certificate (Valid for Life)',
    importantDates: {
      notificationDate: '2026-06-15',
      applyStartDate: '2026-06-17',
      applyDeadline: '2026-07-20',
      examDate: '2026-09-15'
    },
    eligibilityCriteria: {
      age: {
        minAge: 18,
        maxAge: 99, // No upper age limit for CTET!
        cutoffDobMin: '1st Jan 1950',
        cutoffDobMax: '1st Jan 2008',
        relaxationsText: 'NO UPPER AGE LIMIT! Any candidate who fulfills educational qualifications can appear for CTET.'
      },
      gender: 'All',
      maritalStatus: ['Unmarried', 'Married'],
      nationality: ['Citizen of India'],
      education: {
        minLevel: 'Graduation or 12th + D.El.Ed / B.Ed',
        requiredStreams: ['Arts', 'Science', 'Commerce', 'Education (B.Ed/D.El.Ed)'],
        streamRulesText: 'Paper I (Classes I-V): 12th Pass with min 50% AND 2-year Diploma in Elementary Education (D.El.Ed) or 4-year B.El.Ed. Paper II (Classes VI-VIII): Graduation with min 50% AND 2-year D.El.Ed OR 1-year/2-year B.Ed.',
        minPercentage: 50,
        finalYearEligible: true,
        finalYearText: 'Candidates pursuing final year of D.El.Ed or B.Ed course are eligible to appear for CTET.'
      },
      physicalStandards: {
        applicable: false,
        minHeightMale: null,
        minHeightFemale: null,
        heightRelaxationsText: 'No physical height criteria for teaching eligibility.',
        visionRequirements: 'Normal vision.'
      },
      specialRequirements: {
        nccCertificate: 'Not Applicable',
        other: 'Qualifying Marks: 60% (90/150 marks for General) and 55% (82/150 marks for SC/ST/OBC/PwD).'
      }
    },
    requiredDocuments: [
      '10th Board Certificate',
      '12th Marksheet (min 50%)',
      'Graduation Degree / Marksheet',
      'D.El.Ed / B.Ed / B.El.Ed Degree or Semester Marksheets',
      'Category Certificate (SC/ST/OBC/PwD for qualifying mark relaxation)',
      'Aadhaar Card'
    ],
    selectionProcess: [
      'Paper-I Computer Based Test (150 MCQs - Child Development & Pedagogy, Language I, Language II, Mathematics, Environmental Studies)',
      'Paper-II Computer Based Test (150 MCQs - Child Development, Language I, Language II, Maths & Science OR Social Studies)',
      'Issuance of CTET Eligibility Certificate via DigiLocker (Valid Lifetime)'
    ]
  }
];

module.exports = { EXAMS_DATA };
