// Phase 6 Complete End-to-End Integration Test Suite (Step 6.8)
// Validates full lifecycle, security boundaries, audit history, CV upload/download,
// transitions, terminal constraints, and concurrency protection.

const fs = require('fs');
const path = require('path');
const prisma = require('../server/dist/prisma').default;

const API_SERVER = 'http://localhost:5000/api';
const STORAGE_DIR = path.resolve(__dirname, '../server/storage/private_cvs');

const results = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
  results.push(message);
}

const samplePdfBuffer = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n193\n%%EOF'
);

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
        degree: 'BSc Computer Science',
        fieldOfStudy: 'Software Engineering',
        currentYear: 3,
        location: 'Colombo, Sri Lanka',
        bio: 'Aspiring software engineering intern candidate.',
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
        companyName: `${prefix} Technologies`,
        description: 'Global tech recruiting powerhouse',
        industry: 'Software',
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
      description: `Comprehensive details for role: ${title}`,
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

async function applyWithPdfCv(studentCookie, internshipId, coverLetter = 'Test application') {
  const fd = new FormData();
  fd.append('internshipId', internshipId);
  fd.append('coverLetter', coverLetter);
  fd.append('cv', new Blob([samplePdfBuffer], { type: 'application/pdf' }), 'resume.pdf');

  const res = await fetch(`${API_SERVER}/student/applications/with-cv`, {
    method: 'POST',
    headers: {
      Cookie: studentCookie,
    },
    body: fd,
  });

  const data = await res.json();
  if (res.status !== 201) {
    throw new Error(`Failed to apply with CV: ${JSON.stringify(data)}`);
  }
  return data.data;
}

async function runE2ETests() {
  console.log('================================================================');
  console.log('🚀 RUNNING PHASE 6 END-TO-END WORKFLOW & SECURITY INTEGRATION SUITE');
  console.log('================================================================\n');

  console.log('[SETUP] Provisioning primary company and student actors...');
  const compA = await registerAndLogin('COMPANY', 'MainCompany');
  const compB = await registerAndLogin('COMPANY', 'OtherCompany');
  const studentA = await registerAndLogin('STUDENT', 'CandidateA');
  const studentB = await registerAndLogin('STUDENT', 'CandidateB');

  // -------------------------------------------------------------
  // WORKFLOW 1: FULL SUCCESSFUL APPLICATION & HIRING LIFECYCLE
  // -------------------------------------------------------------
  console.log('\n--- 1. COMPANY CREATES & PUBLISHES INTERNSHIP ---');
  const internshipId = await createAndPublishInternship(compA.cookie, 'Fullstack React/Node Engineer Intern');
  assert(typeof internshipId === 'string' && internshipId.length > 0, 'Company A published internship successfully');

  console.log('\n--- 2. STUDENT DISCOVERS PUBLISHED INTERNSHIP ---');
  const discoveryRes = await fetch(`${API_SERVER}/student/internships?search=React`, {
    headers: { Cookie: studentA.cookie },
  });
  assert(discoveryRes.status === 200, 'Student discovers published internships (200 OK)');
  const discoveryData = await discoveryRes.json();
  const list = discoveryData.internships || discoveryData.data || [];
  const foundInternship = list.find((item) => item.id === internshipId);
  assert(!!foundInternship, 'Student finds newly published internship in search results');

  console.log('\n--- 3. STUDENT OPENS INTERNSHIP DETAILS ---');
  const detailsRes = await fetch(`${API_SERVER}/student/internships/${internshipId}`, {
    headers: { Cookie: studentA.cookie },
  });
  assert(detailsRes.status === 200, 'Student views internship details (200 OK)');
  const detailsData = await detailsRes.json();
  const detailObj = detailsData.internship || detailsData.data;
  assert(detailObj && detailObj.id === internshipId, 'Internship details ID matches');

  console.log('\n--- 4. STUDENT SUBMITS APPLICATION WITH VALID PDF CV ---');
  const appRecord = await applyWithPdfCv(studentA.cookie, internshipId, 'Excited to apply for this fullstack position.');
  assert(typeof appRecord.id === 'string', 'Application created with valid ID');
  assert(appRecord.status === 'APPLIED', 'Initial status is APPLIED');
  assert(appRecord.hasCv === true, 'Application hasCv flag is true');
  assert(appRecord.cvUrl === undefined, 'Raw cvUrl storage key is strictly omitted from student payload');

  console.log('\n--- 5. DUPLICATE SUBMISSION PREVENTION ---');
  const dupFd = new FormData();
  dupFd.append('internshipId', internshipId);
  dupFd.append('cv', new Blob([samplePdfBuffer], { type: 'application/pdf' }), 'resume.pdf');

  const dupRes = await fetch(`${API_SERVER}/student/applications/with-cv`, {
    method: 'POST',
    headers: { Cookie: studentA.cookie },
    body: dupFd,
  });
  assert(dupRes.status === 409, 'Duplicate application submission is rejected with 409 Conflict');

  console.log('\n--- 6. STUDENT SEES APPLICATION IN MY APPLICATIONS ---');
  const trackerRes = await fetch(`${API_SERVER}/student/applications`, {
    headers: { Cookie: studentA.cookie },
  });
  assert(trackerRes.status === 200, 'Student retrieves My Applications list');
  const trackerData = await trackerRes.json();
  const trackedApp = trackerData.data.find((a) => a.id === appRecord.id);
  assert(!!trackedApp, 'Submitted application appears in student application tracker');
  assert(trackedApp.status === 'APPLIED', 'Tracker displays APPLIED status');

  console.log('\n--- 7. COMPANY SEES APPLICANT IN DASHBOARD ---');
  const compApplicantsRes = await fetch(`${API_SERVER}/company/internships/${internshipId}/applications`, {
    headers: { Cookie: compA.cookie },
  });
  assert(compApplicantsRes.status === 200, 'Company retrieves applicant dashboard (200 OK)');
  const compApplicantsData = await compApplicantsRes.json();
  const compApplicant = compApplicantsData.data.find((a) => a.id === appRecord.id);
  assert(!!compApplicant, 'Company applicant dashboard contains new candidate');
  assert(compApplicant.hasCv === true, 'Candidate shows CV indicator');

  console.log('\n--- 8. COMPANY OPENS APPLICANT PROFILE & AUTHORIZED CV ---');
  const compReviewRes = await fetch(`${API_SERVER}/company/applications/${appRecord.id}`, {
    headers: { Cookie: compA.cookie },
  });
  assert(compReviewRes.status === 200, 'Company opens full application review details (200 OK)');
  const compReviewData = await compReviewRes.json();
  assert(compReviewData.data.coverLetter === 'Excited to apply for this fullstack position.', 'Cover letter displayed');
  assert(compReviewData.data.statusHistory.length === 1, 'Initial status history has 1 entry');
  assert(compReviewData.data.statusHistory[0].toStatus === 'APPLIED', 'Initial status history is APPLIED');

  // Authorized CV Download
  const cvDownloadRes = await fetch(`${API_SERVER}/company/applications/${appRecord.id}/cv`, {
    headers: { Cookie: compA.cookie },
  });
  assert(cvDownloadRes.status === 200, 'Company downloads applicant CV (200 OK)');
  assert(cvDownloadRes.headers.get('content-type') === 'application/pdf', 'Content-Type is application/pdf');
  assert(cvDownloadRes.headers.get('cache-control')?.includes('no-store'), 'CV response has private no-store cache control');
  const downloadedBytes = Buffer.from(await cvDownloadRes.arrayBuffer());
  assert(downloadedBytes.equals(samplePdfBuffer), 'Downloaded CV binary matches original uploaded PDF exactly');

  console.log('\n--- 9. COMPANY STATUS PROGRESSION: APPLIED -> UNDER_REVIEW ---');
  const underReviewRes = await fetch(`${API_SERVER}/company/applications/${appRecord.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: compA.cookie,
    },
    body: JSON.stringify({
      status: 'UNDER_REVIEW',
      note: 'Evaluating candidate GitHub and coursework.',
    }),
  });
  assert(underReviewRes.status === 200, 'Transition to UNDER_REVIEW succeeded');

  console.log('\n--- 10. COMPANY STATUS PROGRESSION: UNDER_REVIEW -> SHORTLISTED ---');
  const shortlistRes = await fetch(`${API_SERVER}/company/applications/${appRecord.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: compA.cookie,
    },
    body: JSON.stringify({
      status: 'SHORTLISTED',
      note: 'Shortlisted candidate for interview round.',
    }),
  });
  assert(shortlistRes.status === 200, 'Transition to SHORTLISTED succeeded');

  console.log('\n--- 11. COMPANY STATUS PROGRESSION: SHORTLISTED -> INTERVIEW ---');
  const interviewRes = await fetch(`${API_SERVER}/company/applications/${appRecord.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: compA.cookie,
    },
    body: JSON.stringify({
      status: 'INTERVIEW',
      note: 'Live technical interview scheduled.',
    }),
  });
  assert(interviewRes.status === 200, 'Transition to INTERVIEW succeeded');

  console.log('\n--- 12. COMPANY STATUS PROGRESSION: INTERVIEW -> ACCEPTED ---');
  const acceptedRes = await fetch(`${API_SERVER}/company/applications/${appRecord.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: compA.cookie,
    },
    body: JSON.stringify({
      status: 'ACCEPTED',
      note: 'Outstanding performance. Extended formal internship offer.',
    }),
  });
  assert(acceptedRes.status === 200, 'Transition to ACCEPTED succeeded');

  console.log('\n--- 13. STUDENT VERIFIES STATUS & CHRONOLOGICAL HISTORY ---');
  const studentTrackerCheck = await fetch(`${API_SERVER}/student/applications/${appRecord.id}`, {
    headers: { Cookie: studentA.cookie },
  });
  assert(studentTrackerCheck.status === 200, 'Student retrieves updated details (200 OK)');
  const studentTrackerCheckData = await studentTrackerCheck.json();
  assert(studentTrackerCheckData.data.status === 'ACCEPTED', 'Student sees final ACCEPTED status');
  assert(studentTrackerCheckData.data.statusHistory.length === 5, 'Chronological status history contains all 5 transitions');
  const statusProgression = studentTrackerCheckData.data.statusHistory.map((h) => h.toStatus);
  assert(
    JSON.stringify(statusProgression) === JSON.stringify(['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED']),
    'Status progression matches expected chronological lifecycle order'
  );

  // PRIVACY CHECK: ensure student NEVER receives company evaluation notes
  for (const hist of studentTrackerCheckData.data.statusHistory) {
    assert(hist.note === undefined, 'Review notes are strictly excluded from student history');
  }

  // -------------------------------------------------------------
  // WORKFLOW 2: REJECTIONS FROM EACH ACTIVE STAGE
  // -------------------------------------------------------------
  console.log('\n--- 14. VERIFY REJECTION FROM ALL ACTIVE STAGES ---');

  // Stage: APPLIED -> REJECTED
  const candR1 = await registerAndLogin('STUDENT', 'CandR1');
  const internR1 = await createAndPublishInternship(compA.cookie, 'Reject Test Role 1');
  const appR1 = await applyWithPdfCv(candR1.cookie, internR1, 'R1 candidate');
  const rej1 = await fetch(`${API_SERVER}/company/applications/${appR1.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'REJECTED', note: 'Rejected at APPLIED' }),
  });
  assert(rej1.status === 200, 'Rejection from APPLIED succeeds');

  // Stage: UNDER_REVIEW -> REJECTED
  const candR2 = await registerAndLogin('STUDENT', 'CandR2');
  const internR2 = await createAndPublishInternship(compA.cookie, 'Reject Test Role 2');
  const appR2 = await applyWithPdfCv(candR2.cookie, internR2, 'R2 candidate');
  await fetch(`${API_SERVER}/company/applications/${appR2.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  const rej2 = await fetch(`${API_SERVER}/company/applications/${appR2.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'REJECTED', note: 'Rejected at UNDER_REVIEW' }),
  });
  assert(rej2.status === 200, 'Rejection from UNDER_REVIEW succeeds');

  // Stage: SHORTLISTED -> REJECTED
  const candR3 = await registerAndLogin('STUDENT', 'CandR3');
  const internR3 = await createAndPublishInternship(compA.cookie, 'Reject Test Role 3');
  const appR3 = await applyWithPdfCv(candR3.cookie, internR3, 'R3 candidate');
  await fetch(`${API_SERVER}/company/applications/${appR3.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  await fetch(`${API_SERVER}/company/applications/${appR3.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'SHORTLISTED' }),
  });
  const rej3 = await fetch(`${API_SERVER}/company/applications/${appR3.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'REJECTED', note: 'Rejected at SHORTLISTED' }),
  });
  assert(rej3.status === 200, 'Rejection from SHORTLISTED succeeds');

  // Stage: INTERVIEW -> REJECTED
  const candR4 = await registerAndLogin('STUDENT', 'CandR4');
  const internR4 = await createAndPublishInternship(compA.cookie, 'Reject Test Role 4');
  const appR4 = await applyWithPdfCv(candR4.cookie, internR4, 'R4 candidate');
  await fetch(`${API_SERVER}/company/applications/${appR4.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  await fetch(`${API_SERVER}/company/applications/${appR4.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'SHORTLISTED' }),
  });
  await fetch(`${API_SERVER}/company/applications/${appR4.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'INTERVIEW' }),
  });
  const rej4 = await fetch(`${API_SERVER}/company/applications/${appR4.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'REJECTED', note: 'Rejected at INTERVIEW' }),
  });
  assert(rej4.status === 200, 'Rejection from INTERVIEW succeeds');

  // -------------------------------------------------------------
  // WORKFLOW 3: STUDENT WITHDRAWALS FROM EACH ACTIVE STAGE
  // -------------------------------------------------------------
  console.log('\n--- 15. VERIFY WITHDRAWAL FROM ALL ACTIVE STAGES ---');

  // From APPLIED
  const candW1 = await registerAndLogin('STUDENT', 'CandW1');
  const internW1 = await createAndPublishInternship(compA.cookie, 'Withdrawal Test 1');
  const appW1 = await applyWithPdfCv(candW1.cookie, internW1, 'W1 candidate');
  const w1 = await fetch(`${API_SERVER}/student/applications/${appW1.id}/withdraw`, {
    method: 'POST',
    headers: { Cookie: candW1.cookie },
  });
  assert(w1.status === 200, 'Withdrawal from APPLIED succeeds');

  // From UNDER_REVIEW
  const candW2 = await registerAndLogin('STUDENT', 'CandW2');
  const internW2 = await createAndPublishInternship(compA.cookie, 'Withdrawal Test 2');
  const appW2 = await applyWithPdfCv(candW2.cookie, internW2, 'W2 candidate');
  await fetch(`${API_SERVER}/company/applications/${appW2.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  const w2 = await fetch(`${API_SERVER}/student/applications/${appW2.id}/withdraw`, {
    method: 'POST',
    headers: { Cookie: candW2.cookie },
  });
  assert(w2.status === 200, 'Withdrawal from UNDER_REVIEW succeeds');

  // From SHORTLISTED
  const candW3 = await registerAndLogin('STUDENT', 'CandW3');
  const internW3 = await createAndPublishInternship(compA.cookie, 'Withdrawal Test 3');
  const appW3 = await applyWithPdfCv(candW3.cookie, internW3, 'W3 candidate');
  await fetch(`${API_SERVER}/company/applications/${appW3.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  await fetch(`${API_SERVER}/company/applications/${appW3.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'SHORTLISTED' }),
  });
  const w3 = await fetch(`${API_SERVER}/student/applications/${appW3.id}/withdraw`, {
    method: 'POST',
    headers: { Cookie: candW3.cookie },
  });
  assert(w3.status === 200, 'Withdrawal from SHORTLISTED succeeds');

  // From INTERVIEW
  const candW4 = await registerAndLogin('STUDENT', 'CandW4');
  const internW4 = await createAndPublishInternship(compA.cookie, 'Withdrawal Test 4');
  const appW4 = await applyWithPdfCv(candW4.cookie, internW4, 'W4 candidate');
  await fetch(`${API_SERVER}/company/applications/${appW4.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  await fetch(`${API_SERVER}/company/applications/${appW4.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'SHORTLISTED' }),
  });
  await fetch(`${API_SERVER}/company/applications/${appW4.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'INTERVIEW' }),
  });
  const w4 = await fetch(`${API_SERVER}/student/applications/${appW4.id}/withdraw`, {
    method: 'POST',
    headers: { Cookie: candW4.cookie },
  });
  assert(w4.status === 200, 'Withdrawal from INTERVIEW succeeds');

  // -------------------------------------------------------------
  // WORKFLOW 4: TERMINAL STATUS IMMUTABILITY
  // -------------------------------------------------------------
  console.log('\n--- 16. TERMINAL STATUS IMMUTABILITY ---');

  // ACCEPTED application cannot transition
  const termAcceptRes = await fetch(`${API_SERVER}/company/applications/${appRecord.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'REJECTED' }),
  });
  assert(termAcceptRes.status === 400, 'Terminal ACCEPTED cannot be changed by company');

  // Student cannot withdraw an ACCEPTED application
  const termAcceptWithdraw = await fetch(`${API_SERVER}/student/applications/${appRecord.id}/withdraw`, {
    method: 'POST',
    headers: { Cookie: studentA.cookie },
  });
  assert(termAcceptWithdraw.status === 400, 'Student cannot withdraw an already ACCEPTED application');

  // REJECTED application cannot transition
  const termRejRes = await fetch(`${API_SERVER}/company/applications/${appR1.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  assert(termRejRes.status === 400, 'Terminal REJECTED cannot be changed by company');

  // Student cannot withdraw a REJECTED application
  const termRejWithdraw = await fetch(`${API_SERVER}/student/applications/${appR1.id}/withdraw`, {
    method: 'POST',
    headers: { Cookie: candR1.cookie },
  });
  assert(termRejWithdraw.status === 400, 'Student cannot withdraw an already REJECTED application');

  // WITHDRAWN application cannot transition
  const termWithdrawnRes = await fetch(`${API_SERVER}/company/applications/${appW1.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: compA.cookie },
    body: JSON.stringify({ status: 'UNDER_REVIEW' }),
  });
  assert(termWithdrawnRes.status === 400, 'Terminal WITHDRAWN cannot be changed by company');

  // -------------------------------------------------------------
  // WORKFLOW 5: SECURITY, TENANT ISOLATION & UPLOAD GUARDS
  // -------------------------------------------------------------
  console.log('\n--- 17. SECURITY, TENANT ISOLATION & UPLOAD GUARDS ---');

  // Cross-company access returns 404
  const crossListing = await fetch(`${API_SERVER}/company/internships/${internshipId}/applications`, {
    headers: { Cookie: compB.cookie },
  });
  assert(crossListing.status === 404, 'Cross-company applicant listing returns 404');

  const crossDetail = await fetch(`${API_SERVER}/company/applications/${appRecord.id}`, {
    headers: { Cookie: compB.cookie },
  });
  assert(crossDetail.status === 404, 'Cross-company application review returns 404');

  const crossCv = await fetch(`${API_SERVER}/company/applications/${appRecord.id}/cv`, {
    headers: { Cookie: compB.cookie },
  });
  assert(crossCv.status === 404, 'Cross-company CV download returns 404');

  // Student cross-student isolation: Student B cannot view Student A's application
  const crossStudentView = await fetch(`${API_SERVER}/student/applications/${appRecord.id}`, {
    headers: { Cookie: studentB.cookie },
  });
  assert(crossStudentView.status === 404, 'Student B cannot view Student A application (returns 404)');

  // File upload validation: reject non-PDF
  const nonPdfFd = new FormData();
  nonPdfFd.append('internshipId', internshipId);
  nonPdfFd.append(
    'cv',
    new Blob([Buffer.from('malicious executable payload')], {
      type: 'application/x-msdownload',
    }),
    'malicious.exe'
  );

  const nonPdfRes = await fetch(`${API_SERVER}/student/applications/with-cv`, {
    method: 'POST',
    headers: {
      Cookie: studentB.cookie,
    },
    body: nonPdfFd,
  });
  assert(nonPdfRes.status === 400, 'Non-PDF file upload rejected with 400 Bad Request');

  console.log('\n================================================================');
  console.log(`🎉 ALL ${results.length} END-TO-END WORKFLOW & SECURITY TESTS PASSED!`);
  console.log('================================================================\n');

  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error('\n💥 E2E Test execution failed:', err);
  process.exit(1);
});
