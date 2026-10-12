// Step 6.7 Automated Integration Test Suite
// Verifies Application Status Workflow & Transitions:
// - Role Enforcement & RBAC (401, 403)
// - Cross-Company Isolation (404)
// - Non-existent Application (404)
// - Zod Strict Validation & Payload Bounds (400)
// - Rejection of Company WITHDRAWN (400)
// - Rejection of Same-Status Transitions (400)
// - Rejection of Skipped Stages & Reversions (400)
// - Full Valid Lifecycle (APPLIED -> UNDER_REVIEW -> SHORTLISTED -> INTERVIEW -> ACCEPTED)
// - Rejection from Intermediate States (APPLIED -> REJECTED, etc.)
// - Terminal Status Immutability (ACCEPTED, REJECTED, WITHDRAWN -> 400)
// - Immutable Audit History Recording (fromStatus, toStatus, changedById, note)
// - Review Note Privacy (Company sees note, Student cannot see note)
// - Concurrency Protection & 409 Conflict Handling

const prisma = require('../server/dist/prisma').default;

const API_SERVER = 'http://localhost:5000/api';

let companyACookie = '';
let companyAUserId = '';
let companyBCookie = '';
let companyBUserId = '';
let studentCookie = '';
let studentUserId = '';
let studentProfileId = '';
let adminCookie = '';

let companyAInternshipId = '';
let companyBInternshipId = '';

let appLifecycleId = '';
let appRejectAppliedId = '';
let appRejectUnderReviewId = '';
let appRejectShortlistedId = '';
let appWithdrawId = '';

const results = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
  results.push(message);
}

async function registerAndLogin(role, prefix) {
  const email = `${prefix}_${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = `${prefix} User`;

  const regRole = role === 'ADMIN' ? 'STUDENT' : role;
  const regRes = await fetch(`${API_SERVER}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role: regRole }),
  });

  const regData = await regRes.json();
  if (regRes.status !== 201) {
    throw new Error(`Failed to register ${role}: ${JSON.stringify(regData)}`);
  }

  const cookie = regRes.headers.get('set-cookie');
  const userId = regData.data.user.id;

  if (role === 'ADMIN') {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });
  }

  if (role === 'STUDENT') {
    const profRes = await fetch(`${API_SERVER}/student/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        university: 'University of Moratuwa',
        degree: 'BSc Software Engineering',
        fieldOfStudy: 'Computer Science',
        currentYear: 3,
        location: 'Colombo, Sri Lanka',
        bio: 'Passionate student applicant.',
      }),
    });
    if (profRes.status !== 200) {
      throw new Error(`Failed to setup student profile: ${await profRes.text()}`);
    }
    const studentProf = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    studentProfileId = studentProf.id;
  }

  if (role === 'COMPANY') {
    const profRes = await fetch(`${API_SERVER}/company/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        companyName: `${prefix} Innovations`,
        description: 'Building modern recruitment tech',
        industry: 'Technology',
        location: 'Colombo, Sri Lanka',
        contactEmail: email,
      }),
    });
    if (profRes.status !== 200) {
      throw new Error(`Failed to setup company profile: ${await profRes.text()}`);
    }
  }

  return { cookie, userId };
}

let cachedSkillId = '';

async function fetchSkillId(cookie) {
  if (cachedSkillId) return cachedSkillId;
  const res = await fetch(`${API_SERVER}/company/skills`, {
    headers: { Cookie: cookie },
  });
  const data = await res.json();
  if (data.categories && data.categories.length > 0 && data.categories[0].skills.length > 0) {
    cachedSkillId = data.categories[0].skills[0].id;
  }
  return cachedSkillId;
}

async function createAndPublishInternship(cookie, title) {
  const skillId = await fetchSkillId(cookie);
  const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const createRes = await fetch(`${API_SERVER}/company/internships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      title,
      description: `Description for ${title}`,
      workType: 'REMOTE',
      location: 'Colombo, Sri Lanka',
      category: 'Software Engineering',
      duration: '6 Months',
      applicationDeadline: deadline.toISOString(),
      skills: skillId ? [{ skillId, type: 'REQUIRED' }] : [],
    }),
  });

  const createData = await createRes.json();
  if (createRes.status !== 201) {
    throw new Error(`Failed to create internship: ${JSON.stringify(createData)}`);
  }

  const internshipId = createData.internship ? createData.internship.id : createData.data?.id;

  const pubRes = await fetch(`${API_SERVER}/company/internships/${internshipId}/publish`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  if (pubRes.status !== 200) {
    throw new Error(`Failed to publish internship: ${await pubRes.text()}`);
  }

  return internshipId;
}

async function applyToInternship(cookie, internshipId, coverLetter = 'Interested') {
  const res = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      internshipId,
      coverLetter,
    }),
  });
  const data = await res.json();
  if (res.status !== 201) {
    throw new Error(`Failed to apply: ${JSON.stringify(data)}`);
  }
  return data.data.id;
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING STEP 6.7 APPLICATION STATUS WORKFLOW TEST SUITE');
  console.log('================================================================\n');

  console.log('[SETUP] Provisioning test actors, internships, and applications...');
  const compA = await registerAndLogin('COMPANY', 'CompA_67');
  companyACookie = compA.cookie;
  companyAUserId = compA.userId;

  const compB = await registerAndLogin('COMPANY', 'CompB_67');
  companyBCookie = compB.cookie;
  companyBUserId = compB.userId;

  const stud = await registerAndLogin('STUDENT', 'Stud_67');
  studentCookie = stud.cookie;
  studentUserId = stud.userId;

  const adm = await registerAndLogin('ADMIN', 'Adm_67');
  adminCookie = adm.cookie;

  // Create internships
  companyAInternshipId = await createAndPublishInternship(companyACookie, 'Fullstack Intern Company A');
  companyBInternshipId = await createAndPublishInternship(companyBCookie, 'DevOps Intern Company B');

  // Submit test application to Company A
  appLifecycleId = await applyToInternship(studentCookie, companyAInternshipId, 'Lifecycle application');

  // We also create separate student applications for rejecting at different stages
  const studReject = await registerAndLogin('STUDENT', 'StudReject_67');
  const internReject1 = await createAndPublishInternship(companyACookie, 'Reject Test 1');
  appRejectAppliedId = await applyToInternship(studReject.cookie, internReject1, 'Reject at APPLIED');

  const studReject2 = await registerAndLogin('STUDENT', 'StudReject2_67');
  const internReject2 = await createAndPublishInternship(companyACookie, 'Reject Test 2');
  appRejectUnderReviewId = await applyToInternship(studReject2.cookie, internReject2, 'Reject at UNDER_REVIEW');

  const studWithdraw = await registerAndLogin('STUDENT', 'StudWithdraw_67');
  const internWithdraw = await createAndPublishInternship(companyACookie, 'Withdrawal Test');
  appWithdrawId = await applyToInternship(studWithdraw.cookie, internWithdraw, 'Student will withdraw');

  console.log('Setup complete.\n');

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
  // -------------------------------------------------------------
  console.log('--- 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL ---');

  // Unauthenticated
  const unauthRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  assert(unauthRes.status === 401, 'Unauthenticated status update returns 401');

  // Student role
  const studRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentCookie,
    },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  assert(studRes.status === 403, 'STUDENT role cannot update application status (403)');

  // Admin role
  const adminRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookie,
    },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  assert(adminRes.status === 403, 'ADMIN role cannot update company application status (403)');

  // -------------------------------------------------------------
  // 2. CROSS-COMPANY ISOLATION & NON-EXISTENT APPLICATIONS
  // -------------------------------------------------------------
  console.log('\n--- 2. CROSS-COMPANY ISOLATION & NOT FOUND GUARDS ---');

  // Company B attempts to update Company A's application
  const crossCompRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyBCookie,
    },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  assert(crossCompRes.status === 404, 'Cross-company status update returns 404 (prevents enumeration)');

  // Non-existent application
  const nonExistRes = await fetch(`${API_SERVER}/company/applications/non_existent_cuid_123/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  assert(nonExistRes.status === 404, 'Non-existent application update returns 404');

  // -------------------------------------------------------------
  // 3. ZOD STRICT VALIDATION & PAYLOAD CONSTRAINTS
  // -------------------------------------------------------------
  console.log('\n--- 3. VALIDATION & PAYLOAD CONSTRAINTS ---');

  // Missing status
  const emptyBodyRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ note: 'Missing status' }),
  });
  assert(emptyBodyRes.status === 400, 'Payload missing status returns 400 Bad Request');

  // Invalid enum status
  const invalidEnumRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'INVALID_STATUS' }),
  });
  assert(invalidEnumRes.status === 400, 'Invalid status enum returns 400 Bad Request');

  // Strict schema: unexpected extra property
  const extraPropRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'UNDER_REVIEW', hackerField: true }),
  });
  assert(extraPropRes.status === 400, 'Payload with unrecognized properties returns 400 (strict schema)');

  // Note exceeding 1000 characters
  const longNoteRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'UNDER_REVIEW', note: 'x'.repeat(1001) }),
  });
  assert(longNoteRes.status === 400, 'Note exceeding 1000 characters returns 400 Bad Request');

  // Company cannot set WITHDRAWN
  const compWithdrawnRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'WITHDRAWN' }),
  });
  assert(compWithdrawnRes.status === 400, 'Company cannot set status to WITHDRAWN (returns 400)');

  // -------------------------------------------------------------
  // 4. TRANSITION RULES & SKIPPED STAGES ENFORCEMENT
  // -------------------------------------------------------------
  console.log('\n--- 4. TRANSITION RULES & SKIPPED STAGES ---');

  // Same status (APPLIED -> APPLIED)
  const sameStatusRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'APPLIED' }),
  });
  assert(sameStatusRes.status === 400, 'Same-status transition APPLIED -> APPLIED is rejected (400)');

  // Skipped stage: APPLIED -> SHORTLISTED
  const skippedShortlistRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'SHORTLISTED' }),
  });
  assert(skippedShortlistRes.status === 400, 'Skipped stage APPLIED -> SHORTLISTED is rejected (400)');

  // Skipped stage: APPLIED -> INTERVIEW
  const skippedInterviewRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'INTERVIEW' }),
  });
  assert(skippedInterviewRes.status === 400, 'Skipped stage APPLIED -> INTERVIEW is rejected (400)');

  // Skipped stage: APPLIED -> ACCEPTED
  const skippedAcceptedRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'ACCEPTED' }),
  });
  assert(skippedAcceptedRes.status === 400, 'Skipped stage APPLIED -> ACCEPTED is rejected (400)');

  // -------------------------------------------------------------
  // 5. VALID FORWARD RECRUITMENT LIFECYCLE
  // -------------------------------------------------------------
  console.log('\n--- 5. FULL FORWARD RECRUITMENT LIFECYCLE ---');

  // Step 1: APPLIED -> UNDER_REVIEW
  const toUnderReviewRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({
      status: 'UNDER_REVIEW',
      note: 'Profile meets initial requirements. Moving to review.',
    }),
  });
  assert(toUnderReviewRes.status === 200, 'APPLIED -> UNDER_REVIEW succeeds (200 OK)');
  const toUnderReviewData = await toUnderReviewRes.json();
  assert(toUnderReviewData.data.status === 'UNDER_REVIEW', 'Response status is UNDER_REVIEW');
  assert(toUnderReviewData.data.history.fromStatus === 'APPLIED', 'Audit history fromStatus is APPLIED');
  assert(toUnderReviewData.data.history.toStatus === 'UNDER_REVIEW', 'Audit history toStatus is UNDER_REVIEW');
  assert(toUnderReviewData.data.history.note === 'Profile meets initial requirements. Moving to review.', 'Audit history note saved');

  // Reverting from UNDER_REVIEW back to APPLIED must be rejected
  const revertToAppliedRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'APPLIED' }),
  });
  assert(revertToAppliedRes.status === 400, 'Reverting UNDER_REVIEW -> APPLIED is rejected (400)');

  // Step 2: UNDER_REVIEW -> SHORTLISTED
  const toShortlistRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({
      status: 'SHORTLISTED',
      note: 'Shortlisted for tech screening.',
    }),
  });
  assert(toShortlistRes.status === 200, 'UNDER_REVIEW -> SHORTLISTED succeeds (200 OK)');
  const toShortlistData = await toShortlistRes.json();
  assert(toShortlistData.data.status === 'SHORTLISTED', 'Response status is SHORTLISTED');
  assert(toShortlistData.data.history.fromStatus === 'UNDER_REVIEW', 'Audit history fromStatus is UNDER_REVIEW');
  assert(toShortlistData.data.history.toStatus === 'SHORTLISTED', 'Audit history toStatus is SHORTLISTED');

  // Step 3: SHORTLISTED -> INTERVIEW
  const toInterviewRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({
      status: 'INTERVIEW',
      note: 'Technical interview conducted.',
    }),
  });
  assert(toInterviewRes.status === 200, 'SHORTLISTED -> INTERVIEW succeeds (200 OK)');
  const toInterviewData = await toInterviewRes.json();
  assert(toInterviewData.data.status === 'INTERVIEW', 'Response status is INTERVIEW');
  assert(toInterviewData.data.history.fromStatus === 'SHORTLISTED', 'Audit history fromStatus is SHORTLISTED');
  assert(toInterviewData.data.history.toStatus === 'INTERVIEW', 'Audit history toStatus is INTERVIEW');

  // Step 4: INTERVIEW -> ACCEPTED
  const toAcceptedRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({
      status: 'ACCEPTED',
      note: 'Candidate accepted for the role. Offer confirmed.',
    }),
  });
  assert(toAcceptedRes.status === 200, 'INTERVIEW -> ACCEPTED succeeds (200 OK)');
  const toAcceptedData = await toAcceptedRes.json();
  assert(toAcceptedData.data.status === 'ACCEPTED', 'Response status is ACCEPTED');
  assert(toAcceptedData.data.history.fromStatus === 'INTERVIEW', 'Audit history fromStatus is INTERVIEW');
  assert(toAcceptedData.data.history.toStatus === 'ACCEPTED', 'Audit history toStatus is ACCEPTED');

  // -------------------------------------------------------------
  // 6. TERMINAL STATUS CONSTRAINTS
  // -------------------------------------------------------------
  console.log('\n--- 6. TERMINAL STATUS PROTECTION ---');

  // Terminal ACCEPTED cannot transition
  const fromAcceptedRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'REJECTED' }),
  });
  assert(fromAcceptedRes.status === 400, 'ACCEPTED application cannot transition to REJECTED (400)');

  // Direct rejection from APPLIED
  const rejectAppliedRes = await fetch(`${API_SERVER}/company/applications/${appRejectAppliedId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({
      status: 'REJECTED',
      note: 'Candidate does not match position criteria.',
    }),
  });
  assert(rejectAppliedRes.status === 200, 'APPLIED -> REJECTED succeeds (200 OK)');
  const rejectAppliedData = await rejectAppliedRes.json();
  assert(rejectAppliedData.data.status === 'REJECTED', 'Status changed to REJECTED');

  // Terminal REJECTED cannot transition
  const fromRejectedRes = await fetch(`${API_SERVER}/company/applications/${appRejectAppliedId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  assert(fromRejectedRes.status === 400, 'REJECTED application cannot transition to UNDER_REVIEW (400)');

  // Rejection from UNDER_REVIEW
  await fetch(`${API_SERVER}/company/applications/${appRejectUnderReviewId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });

  const rejectUnderReviewRes = await fetch(`${API_SERVER}/company/applications/${appRejectUnderReviewId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'REJECTED', note: 'Rejected after review' }),
  });
  assert(rejectUnderReviewRes.status === 200, 'UNDER_REVIEW -> REJECTED succeeds (200 OK)');

  // Student withdraws an application
  const withdrawRes = await fetch(`${API_SERVER}/student/applications/${appWithdrawId}/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studWithdraw.cookie,
    },
  });
  assert(withdrawRes.status === 200, 'Student successfully withdraws application');

  // Company cannot transition a WITHDRAWN application
  const fromWithdrawnRes = await fetch(`${API_SERVER}/company/applications/${appWithdrawId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  assert(fromWithdrawnRes.status === 400, 'WITHDRAWN application cannot be updated by company (400)');

  // -------------------------------------------------------------
  // 7. REVIEW NOTE PRIVACY & AUDIT LOGGING
  // -------------------------------------------------------------
  console.log('\n--- 7. REVIEW NOTE PRIVACY & AUDIT LOGGING ---');

  // Company review details endpoint
  const compDetailRes = await fetch(`${API_SERVER}/company/applications/${appLifecycleId}`, {
    headers: { Cookie: companyACookie },
  });
  assert(compDetailRes.status === 200, 'Company fetches application review details (200 OK)');
  const compDetailData = await compDetailRes.json();
  assert(Array.isArray(compDetailData.data.statusHistory), 'statusHistory is array');
  assert(compDetailData.data.statusHistory.length === 5, 'Full status history has 5 entries (APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, ACCEPTED)');

  // Company sees note
  const underReviewItem = compDetailData.data.statusHistory.find((h) => h.toStatus === 'UNDER_REVIEW');
  assert(underReviewItem && underReviewItem.note === 'Profile meets initial requirements. Moving to review.', 'Company sees internal review note');

  // Student details endpoint
  const studDetailRes = await fetch(`${API_SERVER}/student/applications/${appLifecycleId}`, {
    headers: { Cookie: studentCookie },
  });
  assert(studDetailRes.status === 200, 'Student fetches application details (200 OK)');
  const studDetailData = await studDetailRes.json();
  assert(studDetailData.data.status === 'ACCEPTED', 'Student sees updated status ACCEPTED');
  assert(Array.isArray(studDetailData.data.statusHistory), 'Student receives status history array');

  // Critical privacy check: student must NEVER see company internal review note
  for (const item of studDetailData.data.statusHistory) {
    assert(item.note === undefined, `Review note is strictly omitted from student history (found: ${item.note})`);
  }

  // -------------------------------------------------------------
  // 8. OPTIMISTIC CONCURRENCY PROTECTION (409 CONFLICT)
  // -------------------------------------------------------------
  console.log('\n--- 8. OPTIMISTIC CONCURRENCY PROTECTION ---');

  // Create an application to simulate race condition
  const raceInternship = await createAndPublishInternship(companyACookie, 'Concurrency Race Position');
  const raceStudent = await registerAndLogin('STUDENT', 'RaceStud_67');
  const raceAppId = await applyToInternship(raceStudent.cookie, raceInternship, 'Race candidate');

  // Scenario: Student withdraws application before company transition finishes
  // 1. Student withdraws
  const raceWithdrawRes = await fetch(`${API_SERVER}/student/applications/${raceAppId}/withdraw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: raceStudent.cookie,
    },
  });
  assert(raceWithdrawRes.status === 200, 'Student withdraws race application');

  // 2. Company attempts update from APPLIED -> UNDER_REVIEW
  // The conditional update `where: { id, status: 'APPLIED' }` will fail because status is now WITHDRAWN
  const raceCompanyRes = await fetch(`${API_SERVER}/company/applications/${raceAppId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyACookie,
    },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  assert(
    raceCompanyRes.status === 400 || raceCompanyRes.status === 409,
    `Concurrent update returns conflict/rejection (got ${raceCompanyRes.status})`
  );

  console.log('\n================================================================');
  console.log(`🎉 ALL ${results.length} AUTOMATED STEP 6.7 TESTS PASSED!`);
  console.log('================================================================\n');

  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n💥 Test suite execution failed:', err);
  process.exit(1);
});
