/**
 * Engine to evaluate candidate eligibility against competitive exam criteria
 * with detailed breakdown, age relaxation math, stream checks, and document checklists.
 */

function calculateAge(dobString, referenceDateStr = null) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  
  if (isNaN(dob.getTime())) return null;

  let age = ref.getFullYear() - dob.getFullYear();
  const m = ref.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) {
    age--;
  }

  // Exact fractional age calculation
  const diffMs = ref.getTime() - dob.getTime();
  const exactYears = parseFloat((diffMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1));

  return exactYears;
}

function evaluateExamEligibility(candidateProfile, exam) {
  const criteria = exam.eligibilityCriteria;
  const reasons = [];
  const importantConditions = [];
  let eligibleCount = 0;
  let totalCriteriaCount = 0;
  let isNotEligible = false;
  let isConditional = false;

  // 1. AGE EVALUATION
  let ageResult = { passed: true, message: '', userAge: null, minAge: null, maxAge: null, relaxationApplied: null };
  totalCriteriaCount++;
  
  if (candidateProfile.dob) {
    const userAge = calculateAge(candidateProfile.dob);
    ageResult.userAge = userAge;
    const baseMinAge = criteria.age.minAge;
    let baseMaxAge = criteria.age.maxAge;

    // OTA / Special post max age check if applicable
    if (exam.id === 'cds-ima-ota' && candidateProfile.preferredAcademy === 'OTA') {
      baseMaxAge = criteria.age.maxAgeOta || 25;
    } else if (exam.id === 'afcat' && candidateProfile.afcatBranch === 'Ground Duty') {
      baseMaxAge = criteria.age.maxAgeGroundDuty || 26;
    } else if (exam.id === 'ssc-cgl' && candidateProfile.targetCglPost === 'JSO') {
      baseMaxAge = criteria.age.maxAgeCertainPosts || 32;
    }

    // Category relaxation math
    let bonusYears = 0;
    let relaxationText = '';
    const userCategory = (candidateProfile.category || 'General').toUpperCase();

    if (userCategory === 'OBC') {
      bonusYears = 3;
      relaxationText = 'OBC (+3 Years Relaxation)';
    } else if (userCategory === 'SC' || userCategory === 'ST') {
      bonusYears = 5;
      relaxationText = `${userCategory} (+5 Years Relaxation)`;
    } else if (candidateProfile.isExServiceman) {
      bonusYears = 5;
      relaxationText = 'Ex-Servicemen (+5 Years Relaxation)';
    } else if (candidateProfile.isPwd) {
      bonusYears = 10;
      relaxationText = 'PwD (+10 Years Relaxation)';
    }

    const effectiveMaxAge = baseMaxAge + bonusYears;
    ageResult.minAge = baseMinAge;
    ageResult.maxAge = effectiveMaxAge;

    if (userAge < baseMinAge) {
      ageResult.passed = false;
      isNotEligible = true;
      reasons.push(`❌ Underage: Your calculated age is ${userAge} years. Minimum required age is ${baseMinAge} years.`);
    } else if (userAge > effectiveMaxAge) {
      ageResult.passed = false;
      isNotEligible = true;
      reasons.push(`❌ Overage: Your calculated age is ${userAge} years. Maximum allowed age for ${userCategory} category is ${effectiveMaxAge} years (Base max: ${baseMaxAge} yrs${bonusYears > 0 ? ` + ${bonusYears} yrs relaxation` : ''}).`);
    } else {
      eligibleCount++;
      if (bonusYears > 0) {
        ageResult.relaxationApplied = relaxationText;
        reasons.push(`✅ Age Verified: ${userAge} years. Eligible under ${userCategory} category (${baseMinAge} to ${effectiveMaxAge} years).`);
      } else {
        reasons.push(`✅ Age Verified: ${userAge} years. Eligible (Allowed range: ${baseMinAge} to ${baseMaxAge} years).`);
      }
    }
  } else {
    ageResult.passed = true;
    isConditional = true;
    reasons.push(`⚠️ Age: Date of birth not provided in profile. Please specify DOB to verify cutoff window.`);
  }

  // 2. GENDER & MARITAL STATUS EVALUATION
  let genderResult = { passed: true, message: '' };
  totalCriteriaCount++;

  const userGender = candidateProfile.gender || 'All';
  const userMarital = candidateProfile.maritalStatus || 'Unmarried';

  // Check Marital Status requirement
  if (criteria.maritalStatus && Array.isArray(criteria.maritalStatus)) {
    if (criteria.maritalStatus.includes('Unmarried') && !criteria.maritalStatus.includes('Married')) {
      if (userMarital === 'Married') {
        genderResult.passed = false;
        isNotEligible = true;
        reasons.push(`❌ Marital Status: Exam requires candidate to be Unmarried. Profile status indicates Married.`);
      } else {
        eligibleCount++;
        reasons.push(`✅ Marital Status: Unmarried (Criteria Matched).`);
      }
    } else {
      eligibleCount++;
      reasons.push(`✅ Marital Status: ${userMarital} (Allowed).`);
    }
  } else {
    eligibleCount++;
  }

  // Check Gender requirement
  if (criteria.gender && criteria.gender !== 'All' && !criteria.gender.includes('Male & Female') && !criteria.gender.includes('All')) {
    if (userGender !== 'All' && !criteria.gender.toLowerCase().includes(userGender.toLowerCase())) {
      isNotEligible = true;
      reasons.push(`❌ Gender Criteria: This entry is strictly for ${criteria.gender}.`);
    }
  }

  // 3. EDUCATION QUALIFICATION EVALUATION
  let eduResult = { passed: true, message: '' };
  totalCriteriaCount++;

  const userQualLevel = candidateProfile.education?.highestLevel || candidateProfile.highestQualification || '10th';
  const minLevelRequired = criteria.education.minLevel;
  const isFinalYear = candidateProfile.education?.status === 'Pursuing Final Year' || candidateProfile.isFinalYear;

  const qualHierarchy = { '10th': 1, '12th': 2, '10th + ITI / Diploma / Degree': 2, 'Diploma': 3, 'Graduation': 4, 'Graduation or 12th + D.El.Ed / B.Ed': 4, 'Post-Graduation': 5 };
  const userRank = qualHierarchy[userQualLevel] || 1;
  const reqRank = qualHierarchy[minLevelRequired] || 1;

  if (userRank < reqRank && !isFinalYear) {
    eduResult.passed = false;
    isNotEligible = true;
    reasons.push(`❌ Educational Qualification: Minimum requirement is ${minLevelRequired}. Your profile shows ${userQualLevel}.`);
  } else {
    // Stream check
    const stream12th = candidateProfile.education?.stream12th || candidateProfile.stream12th || 'Any Stream';
    const degreeName = candidateProfile.education?.degreeName || candidateProfile.degree || '';

    let streamMatch = true;
    if (criteria.education.requiredStreams && Array.isArray(criteria.education.requiredStreams)) {
      const reqStreams = criteria.education.requiredStreams;
      if (reqStreams.includes('Science (PCM)') && !stream12th.includes('PCM') && !degreeName.includes('B.Tech') && !degreeName.includes('B.E.')) {
        streamMatch = false;
      }
    }

    if (!streamMatch) {
      eduResult.passed = false;
      isNotEligible = true;
      reasons.push(`❌ Stream Requirement: Exam requires Physics, Chemistry & Mathematics (PCM) in 12th or B.Tech/B.E. Degree. Profile indicates ${stream12th} / ${degreeName || 'Non-PCM'}.`);
    } else {
      // Percentage check
      const minPct = criteria.education.minPercentage;
      const userGradPct = parseFloat(candidateProfile.education?.graduationPercentage || candidateProfile.graduationPercentage || 0);
      const user12thPct = parseFloat(candidateProfile.education?.overallPercentage12th || candidateProfile.overallPercentage12th || 0);

      let pctPassed = true;
      if (minPct && minPct > 0) {
        if (minLevelRequired === 'Graduation' && userGradPct > 0 && userGradPct < minPct) {
          pctPassed = false;
        } else if (minLevelRequired === '12th' && user12thPct > 0 && user12thPct < minPct) {
          pctPassed = false;
        }
      }

      if (!pctPassed) {
        eduResult.passed = false;
        isNotEligible = true;
        reasons.push(`❌ Percentage Criteria: Minimum ${minPct}% required. Your profile record indicates below required threshold.`);
      } else if (isFinalYear) {
        if (criteria.education.finalYearEligible) {
          isConditional = true;
          reasons.push(`⚠️ Conditionally Eligible (Final Year Candidate): Exam permits final year students. Degree completion proof required before course commencement.`);
        } else {
          isNotEligible = true;
          reasons.push(`❌ Final Year Status: This exam does NOT allow pursuing candidates. Graduation must be completed on application date.`);
        }
      } else {
        eligibleCount++;
        reasons.push(`✅ Education Qualification Matched: Meets ${minLevelRequired} level (${degreeName || stream12th || 'Passed'}).`);
      }
    }
  }

  // 4. PHYSICAL STANDARDS EVALUATION
  if (criteria.physicalStandards && criteria.physicalStandards.applicable) {
    totalCriteriaCount++;
    const userHeight = parseFloat(candidateProfile.heightCm || candidateProfile.physical?.heightCm || 0);
    const minHeight = userGender === 'Female' ? criteria.physicalStandards.minHeightFemale : criteria.physicalStandards.minHeightMale;

    if (userHeight > 0 && minHeight) {
      if (userHeight < minHeight) {
        // Check if candidate belongs to hill region for relaxation
        const userState = candidateProfile.stateDomicile || '';
        const isHillState = ['Odisha Hill Agency', 'Uttarakhand', 'Himachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura', 'Jammu & Kashmir', 'Ladakh'].some(s => userState.includes(s));
        
        if (isHillState) {
          isConditional = true;
          reasons.push(`⚠️ Height Standard: Your height is ${userHeight} cm (Standard is ${minHeight} cm). Hill region relaxation (5 cm) may render you eligible upon verification.`);
        } else {
          isNotEligible = true;
          reasons.push(`❌ Physical Standard (Height): Minimum height required is ${minHeight} cm for ${userGender || 'Male'}. Your profile height is ${userHeight} cm.`);
        }
      } else {
        eligibleCount++;
        reasons.push(`✅ Physical Standards Matched: Height ${userHeight} cm meets minimum requirement of ${minHeight} cm.`);
      }
    } else {
      reasons.push(`ℹ️ Physical Standards: Minimum height requirement is ${minHeight || 157} cm. (Verify during medical test).`);
    }
  }

  // 5. SPECIAL REQUIREMENTS & NCC DIRECT ENTRY
  if (criteria.specialRequirements) {
    if (exam.id === 'ncc-special-entry') {
      const nccCert = candidateProfile.nccCertificate || candidateProfile.special?.nccCertificate || 'None';
      const nccGrade = candidateProfile.nccGrade || candidateProfile.special?.nccGrade || '';
      
      if (nccCert === 'C' && (nccGrade === 'A' || nccGrade === 'B')) {
        reasons.push(`🌟 DIRECT SSB ENTRY EXCLUSIVE: Valid NCC 'C' Certificate (Grade ${nccGrade}) verified! You get DIRECT SSB CALL-UP without written exam!`);
      } else {
        isNotEligible = true;
        reasons.push(`❌ NCC Special Entry Requirement: Mandatory NCC 'C' Certificate with Grade A or B required. Profile indicates NCC ${nccCert} ${nccGrade ? `(Grade ${nccGrade})` : ''}.`);
      }
    } else if (criteria.specialRequirements.nccCertificate && criteria.specialRequirements.nccCertificate.includes('Bonus')) {
      const nccCert = candidateProfile.nccCertificate || 'None';
      if (nccCert !== 'None') {
        reasons.push(`🎖️ NCC Bonus Points Eligible: Holding NCC ${nccCert} Certificate provides bonus marks in written exam / merit list!`);
      }
    }
  }

  // Add Important Exam Conditions
  importantConditions.push(`• Official Website: ${exam.officialPortalName}`);
  if (criteria.maritalStatus && criteria.maritalStatus.includes('Unmarried')) {
    importantConditions.push(`• Candidate must remain unmarried until completion of full training at academy.`);
  }
  if (criteria.education.finalYearText) {
    importantConditions.push(`• ${criteria.education.finalYearText}`);
  }
  if (criteria.physicalStandards && criteria.physicalStandards.heightRelaxationsText) {
    importantConditions.push(`• Height Relaxations: ${criteria.physicalStandards.heightRelaxationsText}`);
  }

  // Determine overall status
  let finalStatus = 'ELIGIBLE';
  let statusColor = 'green';

  if (isNotEligible) {
    finalStatus = 'NOT_ELIGIBLE';
    statusColor = 'red';
  } else if (isConditional) {
    finalStatus = 'CONDITIONALLY_ELIGIBLE';
    statusColor = 'amber';
  }

  const matchPercentage = Math.round((eligibleCount / Math.max(totalCriteriaCount, 1)) * 100);

  return {
    examId: exam.id,
    examTitle: exam.title,
    examShortName: exam.shortName,
    category: exam.category,
    conductingBody: exam.conductingBody,
    officialWebsite: exam.officialWebsite,
    officialPortalName: exam.officialPortalName,
    isOfficialVerified: exam.isOfficialVerified,
    lastVerifiedDate: exam.lastVerifiedDate,
    source: exam.source,
    vacancies: exam.vacancies,
    importantDates: exam.importantDates,
    notificationStatus: exam.notificationStatus,
    status: finalStatus,
    statusColor: statusColor,
    matchPercentage: finalStatus === 'ELIGIBLE' ? 100 : (finalStatus === 'CONDITIONALLY_ELIGIBLE' ? 85 : matchPercentage),
    ageResult,
    eduResult,
    genderResult,
    reasons,
    importantConditions,
    requiredDocuments: exam.requiredDocuments || [],
    selectionProcess: exam.selectionProcess || []
  };
}

module.exports = {
  calculateAge,
  evaluateExamEligibility
};
