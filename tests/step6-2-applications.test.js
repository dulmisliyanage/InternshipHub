// Comprehensive Step 6.2 Student Application API Integration Test Suite
// Validates Authentication, Role-based Authorization, Input Validation,
// Eligibility Rules, Atomicity, Duplicate & Concurrency Guards, Pagination,
// Privacy, and Withdrawal Lifecycle.

const API_SERVER = 'http://localhost:5000/api';
const prisma = require('../server/dist/prisma').default;

let studentACookie = '';
let studentAId = '';
let studentBCookie = '';
let studentBId = '';
let companyCookie = '';
let companyId = '';

let publishedEligibleId = '';
let publishedNullDeadlineId = '';
let draftInternshipId = '';
let closedInternshipId = '';
let expiredInternshipId = '';

let createdApplicationId = '';

const results = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
  results.push(message);
}

async function loginOrRegister(role, prefix) {
  const email = `${prefix}_${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = `${prefix} User`;

  // Register
  const regRes = await fetch(`${API_SERVER}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });

  const regData = await regRes.json();
  if (regRes.status !== 201) {
    throw new Error(`Failed to register ${role}: ${JSON.stringify(regData)}`);
  }

  const cookie = regRes.headers.get('set-cookie');
  const userId = regData.data.user.id;

  // If student, complete student profile
  if (role === 'STUDENT') {
    const profRes = await fetch(`${API_SERVER}/student/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        university: 'University of Colombo',
        degree: 'BSc in Computer Science',
        fieldOfStudy: 'Software Engineering',
        currentYear: 3,
        location: 'Colombo, Sri Lanka',
        bio: 'Passionate full-stack developer',
        skills: [],
      }),
    });
    if (profRes.status !== 200) {
      const errText = await profRes.text();
      throw new Error(`Failed to setup student profile: ${errText}`);
    }
  }

  // If company, complete company profile
  if (role === 'COMPANY') {
    const compRes = await fetch(`${API_SERVER}/company/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        companyName: `${prefix} Tech Ltd`,
        industry: 'Software',
        location: 'Colombo, Sri Lanka',
        website: 'https://example.com',
        description: 'Innovating recruitment solutions',
      }),
    });
    if (compRes.status !== 200) {
      const errText = await compRes.text();
      throw new Error(`Failed to setup company profile: ${errText}`);
    }
  }

  return { cookie, userId };
}

let validSkillId = '';

async function fetchSkillId(cookie) {
  if (validSkillId) return validSkillId;
  const res = await fetch(`${API_SERVER}/company/skills`, {
    headers: { Cookie: cookie },
  });
  const data = await res.json();
  if (data.categories && data.categories.length > 0 && data.categories[0].skills.length > 0) {
    validSkillId = data.categories[0].skills[0].id;
  }
  return validSkillId;
}

async function createInternship(cookie, title, status, deadline) {
  const skillId = await fetchSkillId(cookie);
  // Create internship (starts as DRAFT)
  const createRes = await fetch(`${API_SERVER}/company/internships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      title,
      description: 'Comprehensive software engineering internship position with great mentorship.',
      workType: 'REMOTE',
      location: 'Colombo, Sri Lanka',
      category: 'Software Engineering',
      duration: '6 Months',
      applicationDeadline: deadline ? deadline.toISOString() : null,
      skills: skillId ? [{ skillId, type: 'REQUIRED' }] : [],
    }),
  });

  const createData = await createRes.json();
  if (createRes.status !== 201) {
    throw new Error(`Failed to create internship: ${JSON.stringify(createData)}`);
  }

  const id = createData.internship ? createData.internship.id : createData.data?.id;

  if (status === 'PUBLISHED') {
    const pubRes = await fetch(`${API_SERVER}/company/internships/${id}/publish`, {
      method: 'POST',
      headers: { Cookie: cookie },
    });
    if (pubRes.status !== 200) {
      throw new Error(`Failed to publish internship: ${await pubRes.text()}`);
    }
  } else if (status === 'CLOSED') {
    // Publish then close
    await fetch(`${API_SERVER}/company/internships/${id}/publish`, {
      method: 'POST',
      headers: { Cookie: cookie },
    });
    const closeRes = await fetch(`${API_SERVER}/company/internships/${id}/close`, {
      method: 'POST',
      headers: { Cookie: cookie },
    });
    if (closeRes.status !== 200) {
      throw new Error(`Failed to close internship: ${await closeRes.text()}`);
    }
  }

  return id;
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING PHASE 6, STEP 6.2 STUDENT APPLICATION API TEST SUITE');
  console.log('================================================================\n');

  // --- 1. SETUP ACTORS & INTERNSHIPS ---
  console.log('--- 1. PROVISIONING TEST ACTORS & INTERNSHIPS ---');

  const studentA = await loginOrRegister('STUDENT', 'student_a');
  studentACookie = studentA.cookie;
  studentAId = studentA.userId;

  const studentB = await loginOrRegister('STUDENT', 'student_b');
  studentBCookie = studentB.cookie;
  studentBId = studentB.userId;

  const company = await loginOrRegister('COMPANY', 'corp_step62');
  companyCookie = company.cookie;
  companyId = company.userId;

  console.log('Actors created successfully.');

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);

  publishedEligibleId = await createInternship(companyCookie, 'Full Stack Intern (Active)', 'PUBLISHED', futureDate);
  publishedNullDeadlineId = await createInternship(companyCookie, 'Frontend Intern (No Deadline)', 'PUBLISHED', futureDate);
  await prisma.internship.update({
    where: { id: publishedNullDeadlineId },
    data: { applicationDeadline: null },
  });

  draftInternshipId = await createInternship(companyCookie, 'Backend Intern (Draft)', 'DRAFT', futureDate);
  closedInternshipId = await createInternship(companyCookie, 'Mobile Intern (Closed)', 'CLOSED', futureDate);

  expiredInternshipId = await createInternship(companyCookie, 'QA Intern (Expired)', 'PUBLISHED', futureDate);
  await prisma.internship.update({
    where: { id: expiredInternshipId },
    data: { applicationDeadline: pastDate },
  });

  console.log('Test listings prepared.\n');

  // --- 2. AUTHENTICATION & ROLE AUTHORIZATION ---
  console.log('--- 2. AUTHENTICATION & ROLE-BASED ACCESS CONTROL ---');

  // 2.1 Unauthenticated requests return 401
  const unauthSubmitRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ internshipId: publishedEligibleId }),
  });
  assert(unauthSubmitRes.status === 401, 'Unauthenticated application submission returns 401');

  const unauthListRes = await fetch(`${API_SERVER}/student/applications`);
  assert(unauthListRes.status === 401, 'Unauthenticated application listing returns 401');

  const unauthDetailRes = await fetch(`${API_SERVER}/student/applications/some-id`);
  assert(unauthDetailRes.status === 401, 'Unauthenticated application details returns 401');

  const unauthWithdrawRes = await fetch(`${API_SERVER}/student/applications/some-id/withdraw`, {
    method: 'POST',
  });
  assert(unauthWithdrawRes.status === 401, 'Unauthenticated application withdrawal returns 401');

  // 2.2 Company and Admin role calling student application endpoints returns 403 Forbidden
  const companySubmitRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyCookie,
    },
    body: JSON.stringify({ internshipId: publishedEligibleId }),
  });
  assert(companySubmitRes.status === 403, 'Company role calling student submit returns 403 Forbidden');

  const companyListRes = await fetch(`${API_SERVER}/student/applications`, {
    headers: { Cookie: companyCookie },
  });
  assert(companyListRes.status === 403, 'Company role calling student listing returns 403 Forbidden');

  // --- 3. INPUT VALIDATION & PROHIBITED FIELDS REJECTION ---
  console.log('\n--- 3. INPUT VALIDATION & PROHIBITED FIELDS REJECTION ---');

  // 3.1 Prohibited field 'cvUrl' rejected by strict schema
  const cvUrlSpoofRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentACookie,
    },
    body: JSON.stringify({
      internshipId: publishedEligibleId,
      cvUrl: 'https://malicious-public-url.com/cv.pdf',
    }),
  });
  assert(cvUrlSpoofRes.status === 400, 'Arbitrary cvUrl field is rejected by strict validation (400)');

  // 3.2 Prohibited field 'studentProfileId' rejected
  const profileSpoofRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentACookie,
    },
    body: JSON.stringify({
      internshipId: publishedEligibleId,
      studentProfileId: 'spoofed-profile-id',
    }),
  });
  assert(profileSpoofRes.status === 400, 'Spoofed studentProfileId field is rejected by strict validation (400)');

  // 3.3 Missing internshipId rejected
  const missingIdRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentACookie,
    },
    body: JSON.stringify({ coverLetter: 'Hello' }),
  });
  assert(missingIdRes.status === 400, 'Missing internshipId is rejected (400)');

  // --- 4. ELIGIBILITY RULES & INTERNSHIP STATUS CHECKS ---
  console.log('\n--- 4. ELIGIBILITY RULES & INTERNSHIP STATUS CHECKS ---');

  // 4.1 Non-existent internship returns 404
  const nonExistentRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentACookie,
    },
    body: JSON.stringify({ internshipId: 'cuid_non_existent_123' }),
  });
  assert(nonExistentRes.status === 404, 'Applying to non-existent internship returns 404 Not Found');

  // 4.2 DRAFT internship rejected
  const draftApplyRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentACookie,
    },
    body: JSON.stringify({ internshipId: draftInternshipId }),
  });
  assert(draftApplyRes.status === 400, 'Applying to DRAFT internship is rejected (400)');

  // 4.3 CLOSED internship rejected
  const closedApplyRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentACookie,
    },
    body: JSON.stringify({ internshipId: closedInternshipId }),
  });
  assert(closedApplyRes.status === 400, 'Applying to CLOSED internship is rejected (400)');

  // 4.4 Expired deadline internship rejected
  const expiredApplyRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentACookie,
    },
    body: JSON.stringify({ internshipId: expiredInternshipId }),
  });
  assert(expiredApplyRes.status === 400, 'Applying to expired deadline internship is rejected (400)');

  // --- 5. SUCCESSFUL SUBMISSION & ATOMICITY ---
  console.log('\n--- 5. SUCCESSFUL APPLICATION SUBMISSION & ATOMIC TRANSACTION ---');

  // 5.1 Student A applies to eligible published internship
  const applyRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentACookie,
    },
    body: JSON.stringify({
      internshipId: publishedEligibleId,
      coverLetter: 'I am highly passionate about full stack TypeScript development and solving real problems.',
    }),
  });

  const applyData = await applyRes.json();
  assert(applyRes.status === 201, 'Student application submitted successfully (201 Created)');
  assert(applyData.data.status === 'APPLIED', 'Application initial status is APPLIED');
  assert(applyData.data.internshipId === publishedEligibleId, 'Response returns correct internshipId');
  assert(applyData.data.internship.company.companyName.includes('Tech Ltd'), 'Response projects safe company details');
  createdApplicationId = applyData.data.id;

  // 5.2 Published internship with null deadline is eligible
  const nullDeadlineApplyRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentACookie,
    },
    body: JSON.stringify({ internshipId: publishedNullDeadlineId }),
  });
  assert(nullDeadlineApplyRes.status === 201, 'Published internship with null deadline is eligible (201 Created)');

  // --- 6. DUPLICATE & CONCURRENCY PREVENTION ---
  console.log('\n--- 6. DUPLICATE APPLICATION & CONCURRENCY PREVENTION ---');

  // 6.1 Duplicate submission returns 409 Conflict
  const dupRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentACookie,
    },
    body: JSON.stringify({ internshipId: publishedEligibleId }),
  });
  assert(dupRes.status === 409, 'Submitting duplicate application returns 409 Conflict');

  // 6.2 Concurrent simultaneous duplicate requests handled safely
  const concurrentTargetId = await createInternship(companyCookie, 'Concurrency Test Intern', 'PUBLISHED', futureDate);
  const [res1, res2] = await Promise.all([
    fetch(`${API_SERVER}/student/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentACookie },
      body: JSON.stringify({ internshipId: concurrentTargetId }),
    }),
    fetch(`${API_SERVER}/student/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentACookie },
      body: JSON.stringify({ internshipId: concurrentTargetId }),
    }),
  ]);

  const statuses = [res1.status, res2.status].sort();
  assert(statuses[0] === 201 && statuses[1] === 409, 'Concurrent duplicate submissions produce exactly one 201 and one 409');

  // --- 7. APPLICATION LISTING, PAGINATION & FILTERING ---
  console.log('\n--- 7. APPLICATION LISTING, PAGINATION & FILTERING ---');

  // 7.1 Student A lists own applications
  const listRes = await fetch(`${API_SERVER}/student/applications`, {
    headers: { Cookie: studentACookie },
  });
  const listData = await listRes.json();
  assert(listRes.status === 200, 'Student lists applications successfully (200)');
  assert(Array.isArray(listData.data) && listData.data.length >= 2, 'Student receives submitted applications');
  assert(listData.pagination && listData.pagination.total >= 2, 'Pagination metadata included in list response');

  // 7.2 Status filter
  const filterAppliedRes = await fetch(`${API_SERVER}/student/applications?status=APPLIED`, {
    headers: { Cookie: studentACookie },
  });
  const filterAppliedData = await filterAppliedRes.json();
  assert(filterAppliedRes.status === 200 && filterAppliedData.data.every((a) => a.status === 'APPLIED'), 'Status filtering by APPLIED works');

  const filterAcceptedRes = await fetch(`${API_SERVER}/student/applications?status=ACCEPTED`, {
    headers: { Cookie: studentACookie },
  });
  const filterAcceptedData = await filterAcceptedRes.json();
  assert(filterAcceptedRes.status === 200 && filterAcceptedData.data.length === 0, 'Status filtering by unused status returns empty list');

  // 7.3 Pagination limits
  const pageRes = await fetch(`${API_SERVER}/student/applications?page=1&limit=1`, {
    headers: { Cookie: studentACookie },
  });
  const pageData = await pageRes.json();
  assert(pageData.data.length === 1 && pageData.pagination.limit === 1, 'Pagination limit parameter is respected');

  // 7.4 Student B lists applications and cannot see Student A applications
  const studentBListRes = await fetch(`${API_SERVER}/student/applications`, {
    headers: { Cookie: studentBCookie },
  });
  const studentBListData = await studentBListRes.json();
  assert(studentBListRes.status === 200 && studentBListData.data.length === 0, 'Student B cannot see Student A applications (strict ownership isolation)');

  // --- 8. APPLICATION DETAILS & PRIVACY ---
  console.log('\n--- 8. APPLICATION DETAILS & PRIVACY GUARDS ---');

  // 8.1 Student A views own application details
  const detailRes = await fetch(`${API_SERVER}/student/applications/${createdApplicationId}`, {
    headers: { Cookie: studentACookie },
  });
  const detailData = await detailRes.json();
  assert(detailRes.status === 200, 'Student A views own application details (200)');
  assert(detailData.data.id === createdApplicationId, 'Application ID matches');
  assert(detailData.data.statusHistory.length === 1, 'Application statusHistory includes initial APPLIED transition');
  assert(detailData.data.statusHistory[0].toStatus === 'APPLIED', 'Status history shows initial toStatus: APPLIED');
  assert(!('note' in detailData.data.statusHistory[0]), 'Internal notes are not leaked in student-facing status history');

  // 8.2 Student B requests Student A application ID -> returns 404 Not Found
  const privacyRes = await fetch(`${API_SERVER}/student/applications/${createdApplicationId}`, {
    headers: { Cookie: studentBCookie },
  });
  assert(privacyRes.status === 404, 'Viewing another student application returns 404 Not Found (privacy guard)');

  // --- 9. WITHDRAWAL WORKFLOW & CONCURRENCY ---
  console.log('\n--- 9. WITHDRAWAL WORKFLOW & CONCURRENCY PROTECTION ---');

  // 9.1 Student B attempts to withdraw Student A application -> returns 404
  const unauthWithdrawOther = await fetch(`${API_SERVER}/student/applications/${createdApplicationId}/withdraw`, {
    method: 'POST',
    headers: { Cookie: studentBCookie },
  });
  assert(unauthWithdrawOther.status === 404, 'Withdrawing another student application returns 404');

  // 9.2 Student A withdraws own application
  const withdrawRes = await fetch(`${API_SERVER}/student/applications/${createdApplicationId}/withdraw`, {
    method: 'POST',
    headers: { Cookie: studentACookie },
  });
  const withdrawData = await withdrawRes.json();
  assert(withdrawRes.status === 200, 'Student A withdraws application successfully (200)');
  assert(withdrawData.data.status === 'WITHDRAWN', 'Status updated to WITHDRAWN');

  // Verify status history recorded the withdrawal
  const detailAfterWithdraw = await fetch(`${API_SERVER}/student/applications/${createdApplicationId}`, {
    headers: { Cookie: studentACookie },
  });
  const detailAfterWithdrawData = await detailAfterWithdraw.json();
  assert(detailAfterWithdrawData.data.statusHistory.length === 2, 'Status history now records withdrawal transition');
  assert(detailAfterWithdrawData.data.statusHistory[1].fromStatus === 'APPLIED', 'Withdrawal history fromStatus is APPLIED');
  assert(detailAfterWithdrawData.data.statusHistory[1].toStatus === 'WITHDRAWN', 'Withdrawal history toStatus is WITHDRAWN');

  // 9.3 Repeated withdrawal of already withdrawn application returns 400
  const repeatWithdrawRes = await fetch(`${API_SERVER}/student/applications/${createdApplicationId}/withdraw`, {
    method: 'POST',
    headers: { Cookie: studentACookie },
  });
  assert(repeatWithdrawRes.status === 400, 'Repeated withdrawal attempt returns 400 Bad Request');

  // 9.4 Re-applying after withdrawal is prevented by unique constraint
  const reapplyRes = await fetch(`${API_SERVER}/student/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentACookie,
    },
    body: JSON.stringify({ internshipId: publishedEligibleId }),
  });
  assert(reapplyRes.status === 409, 'Re-applying to withdrawn internship is prevented (409 Conflict)');

  // --- 10. REGRESSION CHECK: PHASE 5 DISCOVERY STILL WORKS ---
  console.log('\n--- 10. REGRESSION CHECK: PHASE 5 DISCOVERY APIS ---');

  const discoveryListRes = await fetch(`${API_SERVER}/student/internships`, {
    headers: { Cookie: studentACookie },
  });
  assert(discoveryListRes.status === 200, 'Phase 5 student discovery list continues to work (200)');

  const discoveryDetailRes = await fetch(`${API_SERVER}/student/internships/${publishedEligibleId}`, {
    headers: { Cookie: studentACookie },
  });
  assert(discoveryDetailRes.status === 200, 'Phase 5 student discovery details continues to work (200)');

  console.log('\n================================================================');
  console.log(`🎉 ALL ${results.length} ACCEPTANCE TESTS PASSED SUCCESSFULLY!`);
  console.log('================================================================\n');
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  });
