// Step 6.3 Automated Integration Test Suite
// Verifies Secure Private CV Storage, Multipart Application Submission,
// PDF Validation, File Size Guards, Role Authorization, Eligibility,
// Orphan Cleanup, Data Consistency, and JSON API Backward Compatibility.

const fs = require('fs');
const path = require('path');
const prisma = require('../server/dist/prisma').default;

const API_SERVER = 'http://localhost:5000/api';
const STORAGE_DIR = path.resolve(__dirname, '../server/storage/private_cvs');

let studentACookie = '';
let studentAId = '';
let studentBCookie = '';
let studentBId = '';
let companyCookie = '';
let companyId = '';

let publishedEligibleId = '';
let closedInternshipId = '';
let expiredInternshipId = '';
let draftInternshipId = '';

let createdApplicationId = '';
let createdCvFileName = '';

const results = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
  results.push(message);
}

// Minimal valid PDF binary buffer
const validPdfBuffer = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n193\n%%EOF'
);

// Invalid fake PDF buffer (valid extension/MIME but invalid magic bytes)
const fakePdfBuffer = Buffer.from('NOT_A_REAL_PDF_HEADER_AT_ALL_Just_text');

// Oversized PDF buffer (5.2 MB starting with %PDF-)
const oversizedPdfBuffer = Buffer.concat([
  Buffer.from('%PDF-1.4\n'),
  Buffer.alloc(5.2 * 1024 * 1024, 0x41),
  Buffer.from('\n%%EOF'),
]);

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
        university: 'University of Colombo',
        degree: 'BSc in Computer Science',
        fieldOfStudy: 'Software Engineering',
        currentYear: 3,
        location: 'Colombo, Sri Lanka',
        bio: 'Passionate student developer',
        skills: [],
      }),
    });
    if (profRes.status !== 200) {
      const errText = await profRes.text();
      throw new Error(`Failed to setup student profile: ${errText}`);
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
        description: 'Tech company hiring interns',
        industry: 'Technology',
        location: 'Colombo, Sri Lanka',
        contactEmail: email,
      }),
    });
    if (profRes.status !== 200) {
      const errText = await profRes.text();
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

async function createInternshipWithStatus(companyCookie, title, status, deadlineOffsetDays = 14) {
  const skillId = await fetchSkillId(companyCookie);
  const deadline = new Date(Date.now() + deadlineOffsetDays * 24 * 60 * 60 * 1000);

  const createRes = await fetch(`${API_SERVER}/company/internships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: companyCookie,
    },
    body: JSON.stringify({
      title,
      description: `Description for ${title} with full details and requirements.`,
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

  if (status === 'PUBLISHED') {
    const pubRes = await fetch(`${API_SERVER}/company/internships/${internshipId}/publish`, {
      method: 'POST',
      headers: { Cookie: companyCookie },
    });
    if (pubRes.status !== 200) {
      throw new Error(`Failed to publish internship: ${await pubRes.text()}`);
    }
  } else if (status === 'CLOSED') {
    await fetch(`${API_SERVER}/company/internships/${internshipId}/publish`, {
      method: 'POST',
      headers: { Cookie: companyCookie },
    });
    const closeRes = await fetch(`${API_SERVER}/company/internships/${internshipId}/close`, {
      method: 'POST',
      headers: { Cookie: companyCookie },
    });
    if (closeRes.status !== 200) {
      throw new Error(`Failed to close internship: ${await closeRes.text()}`);
    }
  } else if (status === 'EXPIRED') {
    await fetch(`${API_SERVER}/company/internships/${internshipId}/publish`, {
      method: 'POST',
      headers: { Cookie: companyCookie },
    });
    // Set deadline in the past directly in DB
    await prisma.internship.update({
      where: { id: internshipId },
      data: {
        applicationDeadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    });
  }

  return internshipId;
}

async function runTests() {
  console.log('--- STARTING STEP 6.3 CV UPLOAD & APPLICATION TESTS ---');

  // --- SETUP ---
  console.log('\n[SETUP] Registering users and creating test internships...');
  const studentA = await loginOrRegister('STUDENT', 'cv_student_a');
  studentACookie = studentA.cookie;
  studentAId = studentA.userId;

  const studentB = await loginOrRegister('STUDENT', 'cv_student_b');
  studentBCookie = studentB.cookie;
  studentBId = studentB.userId;

  const company = await loginOrRegister('COMPANY', 'cv_company');
  companyCookie = company.cookie;
  companyId = company.userId;

  publishedEligibleId = await createInternshipWithStatus(companyCookie, 'Full Stack Intern (Eligible)', 'PUBLISHED');
  closedInternshipId = await createInternshipWithStatus(companyCookie, 'Backend Intern (Closed)', 'CLOSED');
  expiredInternshipId = await createInternshipWithStatus(companyCookie, 'DevOps Intern (Expired)', 'EXPIRED');
  draftInternshipId = await createInternshipWithStatus(companyCookie, 'Mobile Intern (Draft)', 'DRAFT');

  console.log('Setup complete.');

  // --- TEST GROUP 1: AUTHENTICATION & AUTHORIZATION ---
  console.log('\n--- Test Group 1: Auth & Role Enforcement ---');

  // 1. Unauthenticated request rejected
  {
    const fd = new FormData();
    fd.append('internshipId', publishedEligibleId);
    fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'cv.pdf');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      body: fd,
    });
    assert(res.status === 401, 'Unauthenticated request returns 401 Unauthorized');
  }

  // 2. Non-student (Company) rejected
  {
    const fd = new FormData();
    fd.append('internshipId', publishedEligibleId);
    fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'cv.pdf');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      headers: { Cookie: companyCookie },
      body: fd,
    });
    assert(res.status === 403, 'Company user cannot submit student application (403 Forbidden)');
  }

  // --- TEST GROUP 2: FILE VALIDATION GUARDS ---
  console.log('\n--- Test Group 2: File Validation Guards ---');

  // 3. Missing CV file rejected
  {
    const fd = new FormData();
    fd.append('internshipId', publishedEligibleId);
    fd.append('coverLetter', 'Here is my cover letter without a CV.');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
      body: fd,
    });
    const data = await res.json();
    assert(res.status === 400 && /pdf.*required|required.*pdf/i.test(data.message), 'Missing CV file is rejected with 400 Bad Request');
  }

  // 4. Invalid file content (corrupt/non-PDF magic bytes) rejected
  {
    const fd = new FormData();
    fd.append('internshipId', publishedEligibleId);
    fd.append('cv', new Blob([fakePdfBuffer], { type: 'application/pdf' }), 'fake.pdf');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
      body: fd,
    });
    const data = await res.json();
    assert(res.status === 400 && data.message.includes('valid PDF document'), 'Fake/corrupted PDF rejected by server magic-byte check (400 Bad Request)');
  }

  // 5. Oversized CV (> 5 MB) rejected
  {
    const initialFiles = fs.readdirSync(STORAGE_DIR);
    const fd = new FormData();
    fd.append('internshipId', publishedEligibleId);
    fd.append('cv', new Blob([oversizedPdfBuffer], { type: 'application/pdf' }), 'large.pdf');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
      body: fd,
    });
    const data = await res.json();
    assert(res.status === 400 && data.message.includes('exceeds the 5 MB limit'), 'Oversized file (>5MB) rejected by server (400 Bad Request)');

    // Ensure no orphaned file saved
    const afterFiles = fs.readdirSync(STORAGE_DIR);
    assert(afterFiles.length === initialFiles.length, 'No orphaned file stored on disk after oversized file rejection');
  }

  // --- TEST GROUP 3: INPUT VALIDATION & ELIGIBILITY ---
  console.log('\n--- Test Group 3: Input Validation & Eligibility ---');

  // 6. Missing internshipId rejected
  {
    const fd = new FormData();
    fd.append('coverLetter', 'Missing internship ID');
    fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'cv.pdf');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
      body: fd,
    });
    assert(res.status === 400, 'Missing internshipId field rejected with 400 Bad Request');
  }

  // 7. Non-existent internship rejected
  {
    const fd = new FormData();
    fd.append('internshipId', '00000000-0000-0000-0000-000000000000');
    fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'cv.pdf');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
      body: fd,
    });
    assert(res.status === 404, 'Non-existent internship returns 404 Not Found');
  }

  // 8. Closed internship rejected
  {
    const fd = new FormData();
    fd.append('internshipId', closedInternshipId);
    fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'cv.pdf');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
      body: fd,
    });
    assert(res.status === 400, 'Closed internship cannot accept applications (400 Bad Request)');
  }

  // 9. Expired internship rejected
  {
    const fd = new FormData();
    fd.append('internshipId', expiredInternshipId);
    fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'cv.pdf');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
      body: fd,
    });
    assert(res.status === 400, 'Expired internship cannot accept applications (400 Bad Request)');
  }

  // 10. Draft internship rejected
  {
    const fd = new FormData();
    fd.append('internshipId', draftInternshipId);
    fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'cv.pdf');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
      body: fd,
    });
    assert(res.status === 400, 'Draft internship cannot accept applications (400 Bad Request)');
  }

  // --- TEST GROUP 4: SUCCESSFUL APPLICATION WITH SECURE CV ---
  console.log('\n--- Test Group 4: Successful Application Submission with CV ---');

  // 11. Valid application submission
  {
    const initialFiles = fs.readdirSync(STORAGE_DIR);

    const fd = new FormData();
    fd.append('internshipId', publishedEligibleId);
    fd.append('coverLetter', 'I am very excited to apply for this full-stack role!');
    fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'Dulsa_Resume.pdf');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
      body: fd,
    });
    const data = await res.json();

    assert(res.status === 201, 'Valid application with CV returns 201 Created');
    assert(data.status === 'success', 'Response status is success');
    assert(data.data.status === 'APPLIED', 'Application initial status is APPLIED');
    assert(data.data.internship.id === publishedEligibleId, 'Associated internship is correct');
    assert(data.data.coverLetter === 'I am very excited to apply for this full-stack role!', 'Cover letter saved correctly');

    // SECURITY CHECK: Private storage key must NOT be leaked in client response
    assert(data.data.cvUrl === undefined, 'cvUrl / private storage key is not exposed in API response');
    assert(!JSON.stringify(data).includes('private_cvs'), 'Private server path is not exposed anywhere in response payload');

    createdApplicationId = data.data.id;

    // Database check: cvUrl is stored privately and securely in DB
    const dbApp = await prisma.application.findUnique({
      where: { id: createdApplicationId },
      include: { statusHistory: true },
    });

    assert(dbApp !== null, 'Application record exists in database');
    assert(typeof dbApp.cvUrl === 'string' && dbApp.cvUrl.startsWith('cv_') && dbApp.cvUrl.endsWith('.pdf'), 'DB cvUrl is unpredictable UUID filename (cv_<uuid>.pdf)');
    assert(!dbApp.cvUrl.includes('/') && !dbApp.cvUrl.includes('\\'), 'DB cvUrl is a pure file identifier with no path traversal');

    createdCvFileName = dbApp.cvUrl;

    // Storage check: File exists on disk in private storage
    const storedFilePath = path.join(STORAGE_DIR, createdCvFileName);
    assert(fs.existsSync(storedFilePath), 'Private CV file exists on disk in private storage');
    assert(fs.readFileSync(storedFilePath).equals(validPdfBuffer), 'Stored file contents match uploaded binary exactly');

    // Status History check
    assert(dbApp.statusHistory.length === 1, 'Status history entry created');
    assert(dbApp.statusHistory[0].toStatus === 'APPLIED', 'Initial status history is APPLIED');
  }

  // --- TEST GROUP 5: DUPLICATE & CONCURRENCY PREVENTION WITH CLEANUP ---
  console.log('\n--- Test Group 5: Duplicate Prevention & Orphan Cleanup ---');

  // 12. Duplicate application rejected with 409 and file cleaned up
  {
    const filesBefore = fs.readdirSync(STORAGE_DIR);

    const fd = new FormData();
    fd.append('internshipId', publishedEligibleId);
    fd.append('coverLetter', 'Attempting duplicate application');
    fd.append('cv', new Blob([validPdfBuffer], { type: 'application/pdf' }), 'duplicate.pdf');

    const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
      body: fd,
    });
    const data = await res.json();

    assert(res.status === 409, 'Duplicate application attempt returns 409 Conflict');
    assert(data.message.includes('already submitted'), 'Error message informs user of existing application');

    // Verify orphan cleanup: no new file left behind
    const filesAfter = fs.readdirSync(STORAGE_DIR);
    assert(filesAfter.length === filesBefore.length, 'Orphaned file removed from storage on duplicate rejection');
  }

  // --- TEST GROUP 6: BACKWARD COMPATIBILITY WITH STEP 6.2 JSON API ---
  console.log('\n--- Test Group 6: Step 6.2 JSON API Backward Compatibility ---');

  // 13. Student B applies via original JSON endpoint without CV
  {
    const res = await fetch(`${API_SERVER}/student/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: studentBCookie,
      },
      body: JSON.stringify({
        internshipId: publishedEligibleId,
        coverLetter: 'Applying through original JSON endpoint.',
      }),
    });
    const data = await res.json();

    assert(res.status === 201, 'Existing JSON application endpoint continues to function (201 Created)');
    assert(data.data.status === 'APPLIED', 'JSON application created with APPLIED status');
    assert(data.data.cvUrl === null || data.data.cvUrl === undefined, 'No CV attached for JSON submission');
  }

  // --- TEST GROUP 7: RETRIEVAL & WITHDRAWAL INTEGRATION ---
  console.log('\n--- Test Group 7: Application Lifecycle (Listing & Withdrawal) ---');

  // 14. Student A retrieves application details
  {
    const res = await fetch(`${API_SERVER}/student/applications/${createdApplicationId}`, {
      method: 'GET',
      headers: { Cookie: studentACookie },
    });
    const data = await res.json();
    assert(res.status === 200, 'Student can retrieve application details (200 OK)');
    assert(data.data.hasCv === true, 'Response indicates CV is attached without exposing private storage key');
    assert(data.data.cvUrl === undefined, 'cvUrl private key remains hidden in single application query');
  }

  // 15. Student A withdraws application
  {
    const res = await fetch(`${API_SERVER}/student/applications/${createdApplicationId}/withdraw`, {
      method: 'POST',
      headers: { Cookie: studentACookie },
    });
    const data = await res.json();
    assert(res.status === 200, 'Student can withdraw application with CV (200 OK)');
    assert(data.data.status === 'WITHDRAWN', 'Status updated to WITHDRAWN');

    const dbApp = await prisma.application.findUnique({
      where: { id: createdApplicationId },
      include: { statusHistory: true },
    });
    assert(dbApp.status === 'WITHDRAWN', 'DB application status is WITHDRAWN');
    assert(dbApp.statusHistory.length === 2, 'Status history now has 2 entries (APPLIED, WITHDRAWN)');
  }

  // --- CLEANUP ---
  console.log('\n[CLEANUP] Removing test CV files...');
  if (createdCvFileName && fs.existsSync(path.join(STORAGE_DIR, createdCvFileName))) {
    fs.unlinkSync(path.join(STORAGE_DIR, createdCvFileName));
    console.log(`Cleaned up test CV: ${createdCvFileName}`);
  }

  console.log('\n========================================');
  console.log(`🎉 ALL ${results.length} AUTOMATED STEP 6.3 TESTS PASSED!`);
  console.log('========================================');
}

runTests()
  .catch((err) => {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
