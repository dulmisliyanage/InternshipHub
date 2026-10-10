// Step 6.5 Automated Integration Test Suite
// Verifies Company Applicant Management API:
// Role Enforcement, Ownership Verification, Applicant Listing,
// Profile Projections, Status Filtering, Pagination, Full Detail Review,
// Secure CV Downloads, Privacy Guards, and Cross-Company Isolation.

const fs = require('fs');
const path = require('path');
const prisma = require('../server/dist/prisma').default;

const API_SERVER = 'http://localhost:5000/api';
const STORAGE_DIR = path.resolve(__dirname, '../server/storage/private_cvs');

let companyACookie = '';
let companyAUserId = '';
let companyBCookie = '';
let companyBUserId = '';
let studentCookie = '';
let studentUserId = '';
let adminCookie = '';

let companyAInternshipId = '';
let companyBInternshipId = '';

let appWithCvId = '';
let appWithoutCvId = '';
let createdCvStorageKey = '';

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
    // Fetch skill to associate with profile
    const skillRes = await fetch(`${API_SERVER}/student/skills`, {
      headers: { Cookie: cookie },
    });
    const skillData = await skillRes.json();
    let skillItem = null;
    if (skillData.categories && skillData.categories.length > 0 && skillData.categories[0].skills.length > 0) {
      skillItem = skillData.categories[0].skills[0];
    }

    const profRes = await fetch(`${API_SERVER}/student/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        university: 'University of Moratuwa',
        degree: 'BSc in Software Engineering',
        fieldOfStudy: 'Computer Science',
        currentYear: 3,
        location: 'Colombo, Sri Lanka',
        bio: 'Passionate full-stack intern candidate.',
        githubUrl: 'https://github.com/applicant-sample',
        linkedinUrl: 'https://linkedin.com/in/applicant-sample',
        portfolioUrl: 'https://sample-portfolio.dev',
        skills: skillItem ? [{ skillId: skillItem.id, proficiency: 'INTERMEDIATE' }] : [],
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
        companyName: `${prefix} Corp`,
        description: 'Innovating recruitment',
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
      description: `Comprehensive internship description for ${title}`,
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
  fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'my_cv.pdf');

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

async function applyWithoutCv(cookie, internshipId, coverLetter) {
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
    throw new Error(`Failed to apply without CV: ${JSON.stringify(data)}`);
  }
  return data.data.id;
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING STEP 6.5 COMPANY APPLICANT MANAGEMENT TEST SUITE');
  console.log('================================================================\n');

  // --- SETUP ---
  console.log('[SETUP] Provisioning test actors, internships, and applications...');
  const companyA = await loginOrRegister('COMPANY', 'comp_a');
  companyACookie = companyA.cookie;
  companyAUserId = companyA.userId;

  const companyB = await loginOrRegister('COMPANY', 'comp_b');
  companyBCookie = companyB.cookie;
  companyBUserId = companyB.userId;

  const student1 = await loginOrRegister('STUDENT', 'applicant_std1');
  studentCookie = student1.cookie;
  studentUserId = student1.userId;

  const admin = await loginOrRegister('ADMIN', 'admin_step65');
  adminCookie = admin.cookie;

  companyAInternshipId = await createAndPublishInternship(companyACookie, 'Full Stack Intern (Company A)');
  companyBInternshipId = await createAndPublishInternship(companyBCookie, 'Mobile App Intern (Company B)');

  // Student 1 applies to Company A's internship with CV
  appWithCvId = await applyWithCv(studentCookie, companyAInternshipId, 'I am excited to apply for Company A with CV!');

  // Student 2 applies to Company A's internship without CV
  const student2 = await loginOrRegister('STUDENT', 'applicant_std2');
  appWithoutCvId = await applyWithoutCv(student2.cookie, companyAInternshipId, 'Applying without CV.');

  // Find the stored CV key in database for verification
  const dbAppWithCv = await prisma.application.findUnique({
    where: { id: appWithCvId },
    select: { cvUrl: true },
  });
  createdCvStorageKey = dbAppWithCv?.cvUrl || '';

  console.log('Setup complete.\n');

  // --- SECTION 1: AUTHENTICATION & ROLE-BASED ACCESS CONTROL ---
  console.log('--- 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL ---');
  {
    // Unauthenticated
    const resList = await fetch(`${API_SERVER}/company/internships/${companyAInternshipId}/applications`);
    assert(resList.status === 401, 'Unauthenticated applicant listing returns 401');

    const resDetail = await fetch(`${API_SERVER}/company/applications/${appWithCvId}`);
    assert(resDetail.status === 401, 'Unauthenticated applicant details returns 401');

    const resCv = await fetch(`${API_SERVER}/company/applications/${appWithCvId}/cv`);
    assert(resCv.status === 401, 'Unauthenticated CV download returns 401');

    // STUDENT role
    const resStudentList = await fetch(`${API_SERVER}/company/internships/${companyAInternshipId}/applications`, {
      headers: { Cookie: studentCookie },
    });
    assert(resStudentList.status === 403, 'STUDENT role cannot access company applicant listing (403)');

    const resStudentDetail = await fetch(`${API_SERVER}/company/applications/${appWithCvId}`, {
      headers: { Cookie: studentCookie },
    });
    assert(resStudentDetail.status === 403, 'STUDENT role cannot access company applicant details (403)');

    const resStudentCv = await fetch(`${API_SERVER}/company/applications/${appWithCvId}/cv`, {
      headers: { Cookie: studentCookie },
    });
    assert(resStudentCv.status === 403, 'STUDENT role cannot download CV via company endpoint (403)');

    // ADMIN role (requireRole('COMPANY') enforces COMPANY only)
    const resAdminList = await fetch(`${API_SERVER}/company/internships/${companyAInternshipId}/applications`, {
      headers: { Cookie: adminCookie },
    });
    assert(resAdminList.status === 403, 'ADMIN role cannot access company applicant listing (403)');
  }

  // --- SECTION 2: APPLICANT LISTING & DATA PROJECTIONS ---
  console.log('\n--- 2. APPLICANT LISTING & DATA PROJECTIONS ---');
  {
    const res = await fetch(`${API_SERVER}/company/internships/${companyAInternshipId}/applications`, {
      headers: { Cookie: companyACookie },
    });
    assert(res.status === 200, 'Company A retrieves applicants for owned internship (200 OK)');

    const body = await res.json();
    assert(body.status === 'success', 'Response status is "success"');
    assert(Array.isArray(body.data), 'body.data is an array of applications');
    assert(body.data.length === 2, 'Returns all 2 applications submitted to the internship');
    assert(body.pagination.total === 2, 'Pagination metadata total is 2');
    assert(body.pagination.page === 1, 'Pagination page is 1');
    assert(body.pagination.limit === 10, 'Pagination limit defaults to 10');
    assert(body.pagination.totalPages === 1, 'Pagination totalPages is 1');

    // Find the application with CV
    const itemWithCv = body.data.find((a) => a.id === appWithCvId);
    assert(!!itemWithCv, 'Application with CV is present in list');
    assert(itemWithCv.status === 'APPLIED', 'Application has initial status APPLIED');
    assert(itemWithCv.hasCv === true, 'hasCv is true for application submitted with CV');
    assert(!itemWithCv.cvUrl, 'Raw cvUrl / storage key is NOT exposed in list item');
    assert(!JSON.stringify(itemWithCv).includes(createdCvStorageKey), 'Raw storage key is completely absent from payload');

    // Safe student projections
    assert(!!itemWithCv.student, 'Student profile object is present');
    assert(typeof itemWithCv.student.name === 'string', 'Student name is present');
    assert(typeof itemWithCv.student.email === 'string', 'Student email is present');
    assert(itemWithCv.student.university === 'University of Moratuwa', 'Student university matches');
    assert(itemWithCv.student.degree === 'BSc in Software Engineering', 'Student degree matches');
    assert(Array.isArray(itemWithCv.student.skills), 'Student skills is an array');

    // Prohibited secret fields must not be present
    assert(!itemWithCv.student.passwordHash, 'passwordHash is not present');
    assert(!JSON.stringify(itemWithCv).includes('passwordHash'), 'No passwordHash in JSON');

    // Find the application without CV
    const itemWithoutCv = body.data.find((a) => a.id === appWithoutCvId);
    assert(!!itemWithoutCv, 'Application without CV is present in list');
    assert(itemWithoutCv.hasCv === false, 'hasCv is false for application submitted without CV');
  }

  // --- SECTION 3: STATUS FILTERING & PAGINATION ---
  console.log('\n--- 3. STATUS FILTERING & PAGINATION ---');
  {
    // Filter by status=APPLIED
    const resApplied = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications?status=APPLIED`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resApplied.status === 200, 'Filtering by status=APPLIED returns 200');
    const appliedBody = await resApplied.json();
    assert(appliedBody.data.length === 2, 'Returns 2 matching APPLIED applications');
    assert(appliedBody.pagination.total === 2, 'Pagination total reflects filter count (2)');

    // Filter by unused status=REJECTED
    const resRejected = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications?status=REJECTED`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resRejected.status === 200, 'Filtering by unused status=REJECTED returns 200');
    const rejectedBody = await resRejected.json();
    assert(rejectedBody.data.length === 0, 'Returns 0 applications for unused status');
    assert(rejectedBody.pagination.total === 0, 'Pagination total is 0');

    // Pagination: limit=1, page=1
    const resPage1 = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications?limit=1&page=1`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resPage1.status === 200, 'Pagination limit=1, page=1 returns 200');
    const page1Body = await resPage1.json();
    assert(page1Body.data.length === 1, 'Page 1 returns exactly 1 item');
    assert(page1Body.pagination.totalPages === 2, 'Total pages is 2');
    assert(page1Body.pagination.page === 1, 'Current page is 1');

    // Pagination: limit=1, page=2
    const resPage2 = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications?limit=1&page=2`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resPage2.status === 200, 'Pagination limit=1, page=2 returns 200');
    const page2Body = await resPage2.json();
    assert(page2Body.data.length === 1, 'Page 2 returns exactly 1 item');
    assert(page2Body.pagination.page === 2, 'Current page is 2');
    assert(page1Body.data[0].id !== page2Body.data[0].id, 'Page 1 and Page 2 contain non-overlapping items');

    // Zod Validation: invalid limit (>50)
    const resInvalidLimit = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications?limit=999`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resInvalidLimit.status === 400, 'Invalid limit (>50) is rejected with 400');

    // Zod Validation: invalid status enum
    const resInvalidStatus = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications?status=INVALID_STATUS`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resInvalidStatus.status === 400, 'Invalid status enum is rejected with 400');
  }

  // --- SECTION 4: CROSS-COMPANY ISOLATION & PRIVACY ---
  console.log('\n--- 4. CROSS-COMPANY ISOLATION & PRIVACY ---');
  {
    // Company B attempts to list Company A's internship applicants
    const resCrossList = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications`,
      { headers: { Cookie: companyBCookie } }
    );
    assert(resCrossList.status === 404, 'Company B accessing Company A internship applicants returns 404');

    // Company B attempts to view Company A's application details
    const resCrossDetail = await fetch(
      `${API_SERVER}/company/applications/${appWithCvId}`,
      { headers: { Cookie: companyBCookie } }
    );
    assert(resCrossDetail.status === 404, 'Company B accessing Company A application details returns 404');

    // Company B attempts to download Company A applicant's CV
    const resCrossCv = await fetch(
      `${API_SERVER}/company/applications/${appWithCvId}/cv`,
      { headers: { Cookie: companyBCookie } }
    );
    assert(resCrossCv.status === 404, 'Company B downloading Company A applicant CV returns 404');

    // Non-existent IDs return 404
    const resNonExistentInternship = await fetch(
      `${API_SERVER}/company/internships/nonexistent_internship_id/applications`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resNonExistentInternship.status === 404, 'Non-existent internship ID returns 404');

    const resNonExistentApp = await fetch(
      `${API_SERVER}/company/applications/nonexistent_app_id`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resNonExistentApp.status === 404, 'Non-existent application ID returns 404');

    const resNonExistentAppCv = await fetch(
      `${API_SERVER}/company/applications/nonexistent_app_id/cv`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resNonExistentAppCv.status === 404, 'Non-existent application ID for CV returns 404');
  }

  // --- SECTION 5: APPLICANT DETAILS REVIEW ---
  console.log('\n--- 5. APPLICANT DETAILS REVIEW ---');
  {
    const res = await fetch(`${API_SERVER}/company/applications/${appWithCvId}`, {
      headers: { Cookie: companyACookie },
    });
    assert(res.status === 200, 'Company A retrieves applicant details (200 OK)');

    const body = await res.json();
    assert(body.status === 'success', 'Response status is "success"');
    const app = body.data;

    assert(app.id === appWithCvId, 'Application ID matches');
    assert(app.status === 'APPLIED', 'Application status is APPLIED');
    assert(app.coverLetter === 'I am excited to apply for Company A with CV!', 'Cover letter matches');
    assert(app.hasCv === true, 'hasCv is true');
    assert(!app.cvUrl, 'Raw cvUrl is NOT exposed in application detail response');

    // Student information
    assert(!!app.student, 'Student details object present');
    assert(app.student.university === 'University of Moratuwa', 'Student university matches');
    assert(app.student.bio === 'Passionate full-stack intern candidate.', 'Student bio matches');
    assert(app.student.githubUrl === 'https://github.com/applicant-sample', 'Student GitHub matches');
    assert(app.student.linkedinUrl === 'https://linkedin.com/in/applicant-sample', 'Student LinkedIn matches');
    assert(Array.isArray(app.student.skills), 'Student skills is an array');

    // Internship information
    assert(app.internship.id === companyAInternshipId, 'Internship ID matches');
    assert(app.internship.title === 'Full Stack Intern (Company A)', 'Internship title matches');

    // Status History
    assert(Array.isArray(app.statusHistory), 'statusHistory is an array');
    assert(app.statusHistory.length >= 1, 'Initial statusHistory entry exists');
    assert(app.statusHistory[0].toStatus === 'APPLIED', 'Initial statusHistory toStatus is APPLIED');
    assert(app.statusHistory[0].changedBy?.role === 'STUDENT', 'Initial status created by student');

    // Exclude secrets
    assert(!JSON.stringify(app).includes('passwordHash'), 'No passwordHash in detail payload');
    assert(!JSON.stringify(app).includes(createdCvStorageKey), 'Raw storage key is not in detail payload');
  }

  // --- SECTION 6: SECURE CV DOWNLOAD & STREAMING ---
  console.log('\n--- 6. SECURE CV DOWNLOAD & STREAMING ---');
  {
    // 1. Authorized download of valid CV
    const res = await fetch(`${API_SERVER}/company/applications/${appWithCvId}/cv`, {
      headers: { Cookie: companyACookie },
    });
    assert(res.status === 200, 'Company A downloads applicant CV (200 OK)');
    assert(res.headers.get('content-type') === 'application/pdf', 'Content-Type is application/pdf');
    assert(
      res.headers.get('content-disposition')?.includes('filename="applicant_cv.pdf"'),
      'Content-Disposition contains safe filename'
    );
    assert(
      res.headers.get('cache-control')?.includes('no-cache'),
      'Cache-Control prevents private document caching'
    );
    assert(
      res.headers.get('x-content-type-options') === 'nosniff',
      'X-Content-Type-Options is nosniff'
    );

    const downloadedBuffer = Buffer.from(await res.arrayBuffer());
    assert(downloadedBuffer.equals(validPdfBuffer), 'Downloaded file bytes match uploaded PDF exactly');

    // 2. Application submitted without CV
    const resNoCv = await fetch(`${API_SERVER}/company/applications/${appWithoutCvId}/cv`, {
      headers: { Cookie: companyACookie },
    });
    assert(resNoCv.status === 404, 'Application without CV returns 404');
    const noCvBody = await resNoCv.json();
    assert(noCvBody.message.includes('No CV attached'), 'Error message states no CV attached');

    // 3. Missing file handling (simulate deleted file on disk)
    const student3 = await loginOrRegister('STUDENT', 'applicant_std3');
    const std3Profile = await prisma.studentProfile.findFirst({ where: { userId: student3.userId } });
    const tempApp = await prisma.application.create({
      data: {
        internshipId: companyAInternshipId,
        studentProfileId: std3Profile.id,
        coverLetter: 'Temp application for missing file test',
        cvUrl: 'cv_missing_file_00000000.pdf',
        status: 'APPLIED',
      },
    });

    const resMissingFile = await fetch(`${API_SERVER}/company/applications/${tempApp.id}/cv`, {
      headers: { Cookie: companyACookie },
    });
    assert(resMissingFile.status === 404, 'Missing file on disk returns 404');
    const missingBody = await resMissingFile.json();
    assert(missingBody.message.includes('CV file not found in storage'), 'Error message states file not found in storage');

    // Clean up temp app
    await prisma.application.delete({ where: { id: tempApp.id } });
  }

  // --- SECTION 7: CLEANUP ---
  console.log('\n[CLEANUP] Removing test CV files from storage...');
  if (createdCvStorageKey) {
    const filePath = path.join(STORAGE_DIR, createdCvStorageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up test CV: ${createdCvStorageKey}`);
    }
  }

  console.log('\n================================================================');
  console.log(`🎉 ALL ${results.length} AUTOMATED STEP 6.5 TESTS PASSED!`);
  console.log('================================================================\n');
}

runTests()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('\n❌ TEST RUN FAILED:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
