// Step 6.4 Automated Integration Test Suite
// Verifies Student Application Tracker API, Status Filtering, Pagination,
// Privacy Isolation, Status History Ordering, Withdrawal Permissions,
// and Terminal Status Protection.

const prisma = require('../server/dist/prisma').default;

const API_SERVER = 'http://localhost:5000/api';

let studentACookie = '';
let studentAId = '';
let studentBCookie = '';
let studentBId = '';
let companyCookie = '';
let companyId = '';

let internship1Id = '';
let internship2Id = '';
let internship3Id = '';

let app1Id = '';
let app2Id = '';
let app3Id = '';

const results = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
  results.push(message);
}

const validPdfBuffer = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n193\n%%EOF'
);

async function loginOrRegister(role, prefix) {
  const email = `${prefix}_${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = `${prefix} User`;

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

  if (role === 'STUDENT') {
    const profRes = await fetch(`${API_SERVER}/student/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        university: 'University of Moratuwa',
        degree: 'BSc in Information Technology',
        fieldOfStudy: 'Software Engineering',
        currentYear: 3,
        location: 'Colombo, Sri Lanka',
        bio: 'Passionate student developer',
        skills: [],
      }),
    });
    if (profRes.status !== 200) {
      throw new Error(`Failed to setup student profile: ${await profRes.text()}`);
    }
  }

  if (role === 'COMPANY') {
    const profRes = await fetch(`${API_SERVER}/company/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        companyName: `${prefix} Innovations Ltd`,
        description: 'Tech company hiring interns',
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
      description: `Description for ${title} with full mentorship and requirements.`,
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

async function applyWithCv(cookie, internshipId, coverLetter) {
  const fd = new FormData();
  fd.append('internshipId', internshipId);
  if (coverLetter) fd.append('coverLetter', coverLetter);
  fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'resume.pdf');

  const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
    method: 'POST',
    headers: { Cookie: cookie },
    body: fd,
  });

  const data = await res.json();
  if (res.status !== 201) {
    throw new Error(`Failed to apply with CV: ${JSON.stringify(data)}`);
  }
  return data.data.id;
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING STEP 6.4 STUDENT APPLICATION TRACKER TEST SUITE');
  console.log('================================================================\n');

  // --- 1. SETUP ---
  console.log('[SETUP] Provisioning test actors and applications...');
  const studentA = await loginOrRegister('STUDENT', 'tracker_student_a');
  studentACookie = studentA.cookie;
  studentAId = studentA.userId;

  const studentB = await loginOrRegister('STUDENT', 'tracker_student_b');
  studentBCookie = studentB.cookie;
  studentBId = studentB.userId;

  const company = await loginOrRegister('COMPANY', 'tracker_company');
  companyCookie = company.cookie;
  companyId = company.userId;

  internship1Id = await createAndPublishInternship(companyCookie, 'Full Stack Intern #1');
  internship2Id = await createAndPublishInternship(companyCookie, 'Frontend Intern #2');
  internship3Id = await createAndPublishInternship(companyCookie, 'DevOps Intern #3');

  // Student A submits 3 applications
  app1Id = await applyWithCv(studentACookie, internship1Id, 'Excited for full-stack role');
  app2Id = await applyWithCv(studentACookie, internship2Id, 'Specializing in React & UI');
  app3Id = await applyWithCv(studentACookie, internship3Id, 'Cloud automation and CI/CD');

  console.log('Setup complete.\n');

  // --- SECTION 1: AUTHENTICATION & ROLE-BASED ACCESS CONTROL ---
  console.log('--- 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL ---');

  // Unauthenticated requests
  {
    const resList = await fetch(`${API_SERVER}/student/applications`);
    assert(resList.status === 401, 'Unauthenticated GET /api/student/applications returns 401');

    const resDetail = await fetch(`${API_SERVER}/student/applications/${app1Id}`);
    assert(resDetail.status === 401, 'Unauthenticated GET /api/student/applications/:id returns 401');

    const resWithdraw = await fetch(`${API_SERVER}/student/applications/${app1Id}/withdraw`, {
      method: 'POST',
    });
    assert(resWithdraw.status === 401, 'Unauthenticated POST /api/student/applications/:id/withdraw returns 401');
  }

  // Company role accessing student endpoints
  {
    const resList = await fetch(`${API_SERVER}/student/applications`, {
      headers: { Cookie: companyCookie },
    });
    assert(resList.status === 403, 'Company user cannot access student applications list (403)');

    const resDetail = await fetch(`${API_SERVER}/student/applications/${app1Id}`, {
      headers: { Cookie: companyCookie },
    });
    assert(resDetail.status === 403, 'Company user cannot access student application details (403)');

    const resWithdraw = await fetch(`${API_SERVER}/student/applications/${app1Id}/withdraw`, {
      method: 'POST',
      headers: { Cookie: companyCookie },
    });
    assert(resWithdraw.status === 403, 'Company user cannot withdraw student application (403)');
  }

  // --- SECTION 2: APPLICATION LISTING & DATA INTEGRITY ---
  console.log('\n--- 2. APPLICATION LISTING & DATA INTEGRITY ---');

  {
    const res = await fetch(`${API_SERVER}/student/applications`, {
      headers: { Cookie: studentACookie },
    });
    const data = await res.json();

    assert(res.status === 200, 'Student retrieves application tracker list (200 OK)');
    assert(data.status === 'success', 'Response status is success');
    assert(Array.isArray(data.data), 'data is an array of applications');
    assert(data.data.length === 3, 'All 3 submitted applications are returned');
    assert(data.pagination.total === 3, 'Pagination metadata accurately reflects total of 3');

    // Verify fields of application cards
    const firstApp = data.data[0];
    assert(firstApp.id !== undefined, 'Application has unique ID');
    assert(firstApp.status === 'APPLIED', 'Application has initial status APPLIED');
    assert(firstApp.hasCv === true, 'hasCv boolean flag is true for CV upload');
    assert(firstApp.cvUrl === undefined, 'Raw storage key / cvUrl is not leaked in list items');
    assert(firstApp.internship !== undefined, 'Internship summary is embedded');
    assert(firstApp.internship.company !== undefined, 'Company summary is embedded');
  }

  // --- SECTION 3: STATUS FILTERING ---
  console.log('\n--- 3. STATUS FILTERING ---');

  // Filter by APPLIED (matches all 3 initially)
  {
    const res = await fetch(`${API_SERVER}/student/applications?status=APPLIED`, {
      headers: { Cookie: studentACookie },
    });
    const data = await res.json();

    assert(res.status === 200, 'Filtering by status=APPLIED succeeds (200 OK)');
    assert(data.data.length === 3, 'All 3 applications returned for status=APPLIED');
    assert(data.pagination.total === 3, 'Pagination total matches filter count');
    assert(data.data.every((a) => a.status === 'APPLIED'), 'Every returned item has status APPLIED');
  }

  // Filter by a status that has zero matching applications (e.g. ACCEPTED)
  {
    const res = await fetch(`${API_SERVER}/student/applications?status=ACCEPTED`, {
      headers: { Cookie: studentACookie },
    });
    const data = await res.json();

    assert(res.status === 200, 'Filtering by empty status=ACCEPTED succeeds (200 OK)');
    assert(data.data.length === 0, 'Zero applications returned for unused status filter');
    assert(data.pagination.total === 0, 'Pagination total is 0 for non-matching filter');
  }

  // --- SECTION 4: SERVER-SIDE PAGINATION ---
  console.log('\n--- 4. SERVER-SIDE PAGINATION ---');

  {
    // Page 1 with limit = 2
    const resP1 = await fetch(`${API_SERVER}/student/applications?page=1&limit=2`, {
      headers: { Cookie: studentACookie },
    });
    const dataP1 = await resP1.json();

    assert(resP1.status === 200, 'Paginated request (page=1, limit=2) succeeds');
    assert(dataP1.data.length === 2, 'Page 1 returns exactly 2 items');
    assert(dataP1.pagination.page === 1, 'Pagination current page is 1');
    assert(dataP1.pagination.limit === 2, 'Pagination limit is 2');
    assert(dataP1.pagination.total === 3, 'Pagination total remains 3');
    assert(dataP1.pagination.totalPages === 2, 'Pagination totalPages is 2');

    // Page 2 with limit = 2
    const resP2 = await fetch(`${API_SERVER}/student/applications?page=2&limit=2`, {
      headers: { Cookie: studentACookie },
    });
    const dataP2 = await resP2.json();

    assert(resP2.status === 200, 'Paginated request (page=2, limit=2) succeeds');
    assert(dataP2.data.length === 1, 'Page 2 returns remaining 1 item');
    assert(dataP2.pagination.page === 2, 'Pagination current page is 2');

    // Verify disjoint sets across pages
    const p1Ids = dataP1.data.map((a) => a.id);
    const p2Ids = dataP2.data.map((a) => a.id);
    assert(!p1Ids.includes(p2Ids[0]), 'Page 1 and Page 2 contain non-overlapping items');
  }

  // --- SECTION 5: APPLICATION DETAILS & TIMELINE ---
  console.log('\n--- 5. APPLICATION DETAILS & TIMELINE ---');

  {
    const res = await fetch(`${API_SERVER}/student/applications/${app1Id}`, {
      headers: { Cookie: studentACookie },
    });
    const data = await res.json();

    assert(res.status === 200, 'Student views application details (200 OK)');
    assert(data.data.id === app1Id, 'Returned details match requested ID');
    assert(data.data.coverLetter === 'Excited for full-stack role', 'Cover letter preserved');
    assert(data.data.hasCv === true, 'hasCv is true in details view');
    assert(data.data.cvUrl === undefined, 'Raw storage key / cvUrl is not leaked in details view');
    assert(data.data.internship.title === 'Full Stack Intern #1', 'Internship title is accurate');
    assert(data.data.internship.company.companyName.includes('tracker_company'), 'Company name is accurate');

    // Status History verification
    assert(Array.isArray(data.data.statusHistory), 'statusHistory is an array');
    assert(data.data.statusHistory.length === 1, 'Initial statusHistory has 1 entry');
    assert(data.data.statusHistory[0].toStatus === 'APPLIED', 'Initial statusHistory toStatus is APPLIED');
    assert(data.data.statusHistory[0].fromStatus === null, 'Initial statusHistory fromStatus is null');
    assert(data.data.statusHistory[0].changedAt !== undefined, 'Status history has changedAt timestamp');
    assert(data.data.statusHistory[0].note === undefined, 'Internal company notes are strictly not exposed in status history');
  }

  // --- SECTION 6: STUDENT ISOLATION & PRIVACY ---
  console.log('\n--- 6. STUDENT ISOLATION & PRIVACY ---');

  {
    // Student B attempts to access Student A's application
    const res = await fetch(`${API_SERVER}/student/applications/${app1Id}`, {
      headers: { Cookie: studentBCookie },
    });
    assert(res.status === 404, 'Student B cannot view Student A application (returns 404 to prevent enumeration)');

    // Student B list is completely isolated
    const resListB = await fetch(`${API_SERVER}/student/applications`, {
      headers: { Cookie: studentBCookie },
    });
    const dataB = await resListB.json();
    assert(dataB.data.length === 0, 'Student B sees 0 applications (strict tenant isolation)');
  }

  // --- SECTION 7: APPLICATION WITHDRAWAL WORKFLOW ---
  console.log('\n--- 7. APPLICATION WITHDRAWAL WORKFLOW ---');

  // Student B attempts to withdraw Student A's application -> 404
  {
    const res = await fetch(`${API_SERVER}/student/applications/${app1Id}/withdraw`, {
      method: 'POST',
      headers: { Cookie: studentBCookie },
    });
    assert(res.status === 404, 'Student B cannot withdraw Student A application (returns 404)');
  }

  // Student A withdraws app1
  {
    const res = await fetch(`${API_SERVER}/student/applications/${app1Id}/withdraw`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
    });
    const data = await res.json();

    assert(res.status === 200, 'Student A withdraws application successfully (200 OK)');
    assert(data.data.status === 'WITHDRAWN', 'Response reflects new WITHDRAWN status');

    // Verify application details after withdrawal
    const resDetail = await fetch(`${API_SERVER}/student/applications/${app1Id}`, {
      headers: { Cookie: studentACookie },
    });
    const detailData = await resDetail.json();

    assert(detailData.data.status === 'WITHDRAWN', 'Details query returns WITHDRAWN status');
    assert(detailData.data.statusHistory.length === 2, 'Status history now has 2 entries');
    assert(detailData.data.statusHistory[1].fromStatus === 'APPLIED', 'Second history fromStatus is APPLIED');
    assert(detailData.data.statusHistory[1].toStatus === 'WITHDRAWN', 'Second history toStatus is WITHDRAWN');

    // Chronological order verification
    const t0 = new Date(detailData.data.statusHistory[0].changedAt).getTime();
    const t1 = new Date(detailData.data.statusHistory[1].changedAt).getTime();
    assert(t1 >= t0, 'Status history transitions are chronologically ordered');
  }

  // --- SECTION 8: TERMINAL STATUS CONSTRAINTS ---
  console.log('\n--- 8. TERMINAL STATUS CONSTRAINTS ---');

  // Attempting to withdraw an already WITHDRAWN application
  {
    const res = await fetch(`${API_SERVER}/student/applications/${app1Id}/withdraw`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
    });
    const data = await res.json();

    assert(res.status === 400, 'Withdrawing an already WITHDRAWN application is rejected (400 Bad Request)');
    assert(data.message.includes('already been withdrawn'), 'Error message informs user application was already withdrawn');
  }

  // Verify status filtering now shows 1 WITHDRAWN and 2 APPLIED
  {
    const resWithdrawn = await fetch(`${API_SERVER}/student/applications?status=WITHDRAWN`, {
      headers: { Cookie: studentACookie },
    });
    const dataWithdrawn = await resWithdrawn.json();
    assert(dataWithdrawn.pagination.total === 1, 'Tracker list correctly filters 1 WITHDRAWN application');

    const resApplied = await fetch(`${API_SERVER}/student/applications?status=APPLIED`, {
      headers: { Cookie: studentACookie },
    });
    const dataApplied = await resApplied.json();
    assert(dataApplied.pagination.total === 2, 'Tracker list correctly filters remaining 2 APPLIED applications');
  }

  console.log('\n================================================================');
  console.log(`🎉 ALL ${results.length} AUTOMATED STEP 6.4 TESTS PASSED!`);
  console.log('================================================================');
}

runTests()
  .catch((err) => {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
