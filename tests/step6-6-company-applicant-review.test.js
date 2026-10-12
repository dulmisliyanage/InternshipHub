// Step 6.6 Automated Integration Test Suite
// Verifies Company Applicant Review UI Integration, APIs,
// RBAC, Ownership Isolation, Pagination, Filtering, Detail Projections,
// Review Notes in Timeline, Secure CV Streaming, and Regression Stability.

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

let companyAInternshipId = '';
let companyBInternshipId = '';

let appWithCvId = '';
let appWithoutCvId = '';
let createdCvKey = '';

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
    // Fetch skill catalog
    const skillRes = await fetch(`${API_SERVER}/student/skills`, {
      headers: { Cookie: cookie },
    });
    const skillData = await skillRes.json();
    let skillId = null;
    if (skillData.categories && skillData.categories.length > 0 && skillData.categories[0].skills.length > 0) {
      skillId = skillData.categories[0].skills[0].id;
    }

    const profRes = await fetch(`${API_SERVER}/student/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify({
        university: 'University of Colombo',
        degree: 'BSc in Information Systems',
        fieldOfStudy: 'Software Engineering',
        currentYear: 3,
        location: 'Colombo, Sri Lanka',
        bio: 'Enthusiastic undergraduate seeking full-stack internship experience.',
        githubUrl: 'https://github.com/step66-student',
        linkedinUrl: 'https://linkedin.com/in/step66-student',
        portfolioUrl: 'https://step66-portfolio.dev',
        skills: skillId ? [{ skillId, proficiency: 'INTERMEDIATE' }] : [],
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
        companyName: `${prefix} Solutions`,
        description: 'Technology and software solutions',
        industry: 'Information Technology',
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
      description: `Description for ${title} with mentorship.`,
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
  fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'student_cv.pdf');

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
  console.log('🚀 RUNNING STEP 6.6 COMPANY APPLICANT REVIEW UI TEST SUITE');
  console.log('================================================================\n');

  // --- SETUP ---
  console.log('[SETUP] Provisioning test companies, students, and applications...');
  const companyA = await loginOrRegister('COMPANY', 'comp_ui_a');
  companyACookie = companyA.cookie;
  companyAUserId = companyA.userId;

  const companyB = await loginOrRegister('COMPANY', 'comp_ui_b');
  companyBCookie = companyB.cookie;
  companyBUserId = companyB.userId;

  const student1 = await loginOrRegister('STUDENT', 'applicant_ui_std1');
  studentCookie = student1.cookie;
  studentUserId = student1.userId;

  const student2 = await loginOrRegister('STUDENT', 'applicant_ui_std2');

  companyAInternshipId = await createAndPublishInternship(companyACookie, 'Full Stack Intern (UI Test)');
  companyBInternshipId = await createAndPublishInternship(companyBCookie, 'Backend Intern (Company B UI Test)');

  // Student 1 applies with CV
  appWithCvId = await applyWithCv(studentCookie, companyAInternshipId, 'I am excited to apply for this full-stack role!');

  // Student 2 applies without CV
  appWithoutCvId = await applyWithoutCv(student2.cookie, companyAInternshipId, 'Applying without CV for test.');

  const dbApp = await prisma.application.findUnique({
    where: { id: appWithCvId },
    select: { cvUrl: true },
  });
  createdCvKey = dbApp?.cvUrl || '';

  // Add a sample status history entry with note to verify timeline rendering in company review
  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: appWithCvId,
      fromStatus: 'APPLIED',
      toStatus: 'UNDER_REVIEW',
      changedById: companyAUserId,
      note: 'Candidate has strong academic background and relevant coursework.',
    },
  });

  // Update application status to UNDER_REVIEW
  await prisma.application.update({
    where: { id: appWithCvId },
    data: { status: 'UNDER_REVIEW' },
  });

  console.log('Setup complete.\n');

  // --- 1. APPLICANT DASHBOARD API INTEGRATION ---
  console.log('--- 1. APPLICANT DASHBOARD API INTEGRATION ---');
  {
    const res = await fetch(`${API_SERVER}/company/internships/${companyAInternshipId}/applications`, {
      headers: { Cookie: companyACookie },
    });
    assert(res.status === 200, 'Company A fetches applicants for owned internship (200 OK)');

    const body = await res.json();
    assert(body.status === 'success', 'Response status is "success"');
    assert(Array.isArray(body.data), 'body.data is an array');
    assert(body.data.length === 2, 'Returns all 2 applications submitted');
    assert(body.pagination.total === 2, 'Accurate pagination total (2)');
    assert(body.pagination.page === 1, 'Current page is 1');
    assert(body.pagination.totalPages === 1, 'Total pages is 1');

    // Verification of applicant item fields required by UI
    const appItem = body.data.find((a) => a.id === appWithCvId);
    assert(!!appItem, 'Applicant with CV found in list');
    assert(appItem.status === 'UNDER_REVIEW', 'Applicant status reflects updated status');
    assert(appItem.hasCv === true, 'hasCv is true');
    assert(!appItem.cvUrl, 'No raw cvUrl storage key exposed');
    assert(!JSON.stringify(appItem).includes(createdCvKey), 'Storage key completely omitted from list');

    // Student profile fields required for ApplicantCard
    assert(appItem.student.university === 'University of Colombo', 'Student university populated');
    assert(appItem.student.degree === 'BSc in Information Systems', 'Student degree populated');
    assert(appItem.student.currentYear === 3, 'Student year populated');
    assert(Array.isArray(appItem.student.skills), 'Skills array populated');
  }

  // --- 2. STATUS FILTERING & PAGINATION QUERY SYNC ---
  console.log('\n--- 2. STATUS FILTERING & PAGINATION QUERY SYNC ---');
  {
    // Filter by UNDER_REVIEW
    const resFiltered = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications?status=UNDER_REVIEW`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resFiltered.status === 200, 'Filtering by status=UNDER_REVIEW succeeds (200 OK)');
    const filteredBody = await resFiltered.json();
    assert(filteredBody.data.length === 1, 'Only 1 applicant has status UNDER_REVIEW');
    assert(filteredBody.data[0].id === appWithCvId, 'Returned applicant is appWithCvId');
    assert(filteredBody.pagination.total === 1, 'Pagination total accurately matches filter count (1)');

    // Filter by unused status SHORTLISTED
    const resUnused = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications?status=SHORTLISTED`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resUnused.status === 200, 'Filtering by unused status succeeds (200 OK)');
    const unusedBody = await resUnused.json();
    assert(unusedBody.data.length === 0, 'Returns 0 results for unused filter');
    assert(unusedBody.pagination.total === 0, 'Pagination total is 0');

    // Pagination query parameters
    const resPaginated = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications?page=1&limit=1`,
      { headers: { Cookie: companyACookie } }
    );
    assert(resPaginated.status === 200, 'Paginated request (page=1, limit=1) succeeds');
    const pageBody = await resPaginated.json();
    assert(pageBody.data.length === 1, 'Returns 1 item per page');
    assert(pageBody.pagination.totalPages === 2, 'Total pages is 2');
  }

  // --- 3. APPLICANT REVIEW DETAILS & TIMELINE WITH NOTES ---
  console.log('\n--- 3. APPLICANT REVIEW DETAILS & TIMELINE WITH NOTES ---');
  {
    const res = await fetch(`${API_SERVER}/company/applications/${appWithCvId}`, {
      headers: { Cookie: companyACookie },
    });
    assert(res.status === 200, 'Company A fetches application review details (200 OK)');

    const body = await res.json();
    const app = body.data;

    assert(app.id === appWithCvId, 'Application ID matches');
    assert(app.coverLetter === 'I am excited to apply for this full-stack role!', 'Cover letter populated');
    assert(app.hasCv === true, 'hasCv is true');
    assert(app.status === 'UNDER_REVIEW', 'Application status matches');
    assert(!app.cvUrl, 'No raw cvUrl storage key leaked in detail response');

    // Applicant full profile
    assert(app.student.bio === 'Enthusiastic undergraduate seeking full-stack internship experience.', 'Student bio populated');
    assert(app.student.githubUrl === 'https://github.com/step66-student', 'GitHub URL populated');
    assert(app.student.linkedinUrl === 'https://linkedin.com/in/step66-student', 'LinkedIn URL populated');
    assert(app.student.portfolioUrl === 'https://step66-portfolio.dev', 'Portfolio URL populated');

    // Chronological status history with reviewer notes
    assert(Array.isArray(app.statusHistory), 'statusHistory is an array');
    assert(app.statusHistory.length === 2, 'Status history contains 2 entries (APPLIED, UNDER_REVIEW)');
    
    // Sort chronological
    const sorted = [...app.statusHistory].sort(
      (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
    );
    assert(sorted[0].toStatus === 'APPLIED', 'First history entry is APPLIED');
    assert(sorted[1].toStatus === 'UNDER_REVIEW', 'Second history entry is UNDER_REVIEW');
    assert(sorted[1].note === 'Candidate has strong academic background and relevant coursework.', 'Review note is visible to company');
    assert(sorted[1].changedBy.role === 'COMPANY', 'Review note author role is COMPANY');
  }

  // --- 4. SECURE CV STREAMING & PRIVACY ---
  console.log('\n--- 4. SECURE CV STREAMING & PRIVACY ---');
  {
    // Authorized CV download
    const resCv = await fetch(`${API_SERVER}/company/applications/${appWithCvId}/cv`, {
      headers: { Cookie: companyACookie },
    });
    assert(resCv.status === 200, 'Company A downloads applicant CV (200 OK)');
    assert(resCv.headers.get('content-type') === 'application/pdf', 'Content-Type is application/pdf');
    assert(
      resCv.headers.get('content-disposition')?.includes('applicant_cv.pdf'),
      'Content-Disposition uses safe filename'
    );
    assert(
      resCv.headers.get('cache-control')?.includes('no-cache'),
      'Cache-Control prevents private document caching'
    );
    assert(
      resCv.headers.get('x-content-type-options') === 'nosniff',
      'X-Content-Type-Options is nosniff'
    );

    const buffer = Buffer.from(await resCv.arrayBuffer());
    assert(buffer.equals(validPdfBuffer), 'Downloaded binary matches uploaded PDF exactly');

    // Application without CV returns 404
    const resNoCv = await fetch(`${API_SERVER}/company/applications/${appWithoutCvId}/cv`, {
      headers: { Cookie: companyACookie },
    });
    assert(resNoCv.status === 404, 'Application without CV returns 404');
  }

  // --- 5. CROSS-COMPANY ISOLATION & RBAC GUARDS ---
  console.log('\n--- 5. CROSS-COMPANY ISOLATION & RBAC GUARDS ---');
  {
    // Company B accessing Company A applicants returns 404
    const resCrossList = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications`,
      { headers: { Cookie: companyBCookie } }
    );
    assert(resCrossList.status === 404, 'Cross-company applicant listing returns 404');

    // Company B accessing Company A application details returns 404
    const resCrossDetail = await fetch(
      `${API_SERVER}/company/applications/${appWithCvId}`,
      { headers: { Cookie: companyBCookie } }
    );
    assert(resCrossDetail.status === 404, 'Cross-company application review returns 404');

    // Company B downloading Company A CV returns 404
    const resCrossCv = await fetch(
      `${API_SERVER}/company/applications/${appWithCvId}/cv`,
      { headers: { Cookie: companyBCookie } }
    );
    assert(resCrossCv.status === 404, 'Cross-company CV download returns 404');

    // Student role cannot access company applicant endpoints
    const resStudentList = await fetch(
      `${API_SERVER}/company/internships/${companyAInternshipId}/applications`,
      { headers: { Cookie: studentCookie } }
    );
    assert(resStudentList.status === 403, 'STUDENT role cannot access company applicant listing (403)');
  }

  // --- 6. CLEANUP ---
  console.log('\n[CLEANUP] Removing test CV files...');
  if (createdCvKey) {
    const filePath = path.join(STORAGE_DIR, createdCvKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up test CV: ${createdCvKey}`);
    }
  }

  console.log('\n================================================================');
  console.log(`🎉 ALL ${results.length} AUTOMATED STEP 6.6 TESTS PASSED!`);
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
